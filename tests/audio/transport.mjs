import { Buffer } from 'node:buffer';
import console from 'node:console';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
const output = await build({ entryPoints: ['src/lib/audio/deckAudio.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { DeckAudio, DEFAULT_MIXER } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
const events = [];
class Param { value=0; calls=[]; setTargetAtTime(...args) { this.calls.push(args); } cancelScheduledValues() {} }
class Node { gain=new Param(); frequency=new Param(); pan=new Param(); delayTime=new Param(); threshold=new Param(); ratio=new Param(); playbackRate=new Param(); connect() {} disconnect() {} start(time) { this.startTime=time; events.push('start'); } stop(time) { this.stopTime=time; } }
class Context {
 currentTime=10; state='suspended'; sources=[];
 createGain=()=>new Node(); createDynamicsCompressor=()=>new Node(); createBiquadFilter=()=>new Node(); createStereoPanner=()=>new Node(); createDelay=()=>new Node();
 createBufferSource=()=> { const n=new Node();this.sources.push(n);return n; };
 createBuffer=(channels,length,sampleRate)=>({length,sampleRate,duration:length/sampleRate,getChannelData:()=>new Float32Array(length)});
 decodeAudioData=async()=>this.createBuffer(1,278528,44100);
 resume() { events.push('resume');this.state='running';return Promise.resolve(); } close() { this.state='closed';return Promise.resolve(); }
}
globalThis.window={AudioContext:Context};
globalThis.fetch=async()=>{events.push('fetch');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};};
const engine=new DeckAudio();
assert.equal(engine.context.sources.length,0,'no autoplay');
await engine.resume();
assert.equal(events[0],'resume','iOS unlock occurs before fetch');
engine.setPads([0,4]);
const first=engine.context.sources;
assert.equal(first.length,8);
assert.equal(new Set(first.map(s=>s.startTime)).size,1,'one exact transport start');
assert.equal(new Set(first.map(s=>s.buffer.length)).size,1,'all buffers aligned');
engine.context.currentTime=13;
engine.setPads([0,4,5,6]);
assert.equal(first.length,8,'late layering does not create or restart sources');
engine.update({...DEFAULT_MIXER,pitch:82});
assert.equal(new Set(first.map(s=>JSON.stringify(s.playbackRate.calls))).size,1,'rate automation identical');
engine.stop();
assert(first.every(s=>s.stopTime===13.05),'all stems stopped');
engine.setPads([0]);
assert.equal(first.length,16,'restart creates fresh synchronized set');
assert.equal(new Set(first.slice(8).map(s=>s.startTime)).size,1);
engine.dispose();assert.equal(engine.context.state,'closed');
for(const name of ['drums','bass','chords','lead']) {
 const bytes=await readFile(`public/audio/arcade/stem-${name}.wav`);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.length,557100);
}
console.log('PASS: gesture unlock, aligned WAVs, shared starts, late layering, shared rate, stop, restart, dispose.');
