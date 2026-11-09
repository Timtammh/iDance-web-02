import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Music2, Radio, Cable, Bluetooth } from "lucide-react";
import styles from "./XD301FeatureStory.module.css";

gsap.registerPlugin(ScrollTrigger);

export function XD301FeatureStory() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-story-reveal]").forEach(element => {
          gsap.from(element, { y:24, autoAlpha:0, duration:0.65, ease:"power2.out", scrollTrigger:{trigger:element,start:"top 92%",once:true}, clearProps:"transform,opacity,visibility" });
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section ref={root} id="InsideXD301" className={styles.story} aria-labelledby="inside-xd301-title">
    <div className={styles.intro} data-story-reveal>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>BRING YOUR MUSIC</span>
        <h2 id="inside-xd301-title">Your tracks.<br/>Your finishing touch.</h2>
        <h3><Bluetooth size={24} aria-hidden="true"/>Play your own tracks</h3>
        <p>Stream music wirelessly over Bluetooth or play MP3 files from USB. Use AUX to connect a tablet or smartphone.</p>
      </div>
    </div>
    <div className={styles.cards}>
      <article data-story-reveal>
        <div className={styles.illustration} aria-hidden="true"><Music2/><span className={styles.genre}>ELECTRO · HOUSE · DISCO</span></div>
        <h3>Find a starting groove.</h3>
        <p>Explore built-in audio loops across electro, house, disco, funk, hip hop and Latin styles.</p>
      </article>
      <article data-story-reveal>
        <div className={styles.illustration} aria-hidden="true"><Radio/><span className={styles.genre}>DROP MIX</span></div>
        <h3>Drop in a jingle.</h3>
        <p>Use Drop Mix to add a catchy jingle and give your mix a different atmosphere.</p>
      </article>
      <article data-story-reveal>
        <div className={styles.illustration} aria-hidden="true"><Cable/><div className={styles.connections}><span>MIC</span><span>AUX</span><span>PHONES</span></div></div>
        <h3>Sing along. Or listen in.</h3>
        <p>Connect a microphone to the microphone port, or plug in headphones for silent listening.</p>
        <p className={styles.note}>Microphone, headphones and AUX cable not included.</p>
      </article>
    </div>
  </section>;
}
