import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Play, Search, Zap } from "lucide-react";
import { companyVideos } from "../../data/companyVideos";
import type { Video } from "../../types/content";
import { track } from "../../lib/analytics";
import { PictureView } from "./ContentCards";
import { Modal } from "./Modal";
import { videoEmbed } from "./VideoGrid";
import styles from "./TVLibrary.module.css";

// Verified on https://www.youtube.com/@idanceaudiocom/shorts, 11 November 2026.
const companyShort: Video = {
  id: "yt-ygumqbd69B8", title: "Power Space shoot", category: "Interactive",
  url: "https://www.youtube.com/shorts/ygumqbd69B8",
  thumbnail: { url: "/media/tv/ygumqbd69B8.jpg", alt: "Power Space shoot demonstration" },
};
const localFilms: Video[] = [
  { id: "film-xd301", title: "XD301", category: "DEEJAY", url: "/media/XD301_EN_10MB.mp4", thumbnail: { url: "/media/xd301-colour-hero.png", alt: "XD301 portable DJ station" } },
  { id: "film-djx101e", title: "DJX101E", category: "Karaoke", url: "/media/DJX101EV2-10MB.mp4", thumbnail: { url: "/media/djx101ev2-poster.jpg", alt: "DJX101E karaoke party system" } },
];
const isShort = (v: Video) => Boolean(v.url && /^https:\/\/(www\.)?youtube\.com\/shorts\//.test(v.url));
const isLocal = (v: Video) => Boolean(v.url?.startsWith("/media/") && v.url.endsWith(".mp4"));
const namedOtherLanguage = /\b(dutch|danish|norsk|norwegian|italiano|italian|portuguese|português|español|spanish|french|français|german|deutsch|polish|swedish|finnish)\b/i;

export function TVLibrary({ videos }: { videos: Video[] }) {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "shorts" ? "shorts" : params.get("view") === "videos" ? "videos" : "home";
  const query = params.get("q") || "";
  const category = params.get("category") || "All";
  const [active, setActive] = useState<Video | null>(null);
  const available = [...companyVideos, ...localFilms, companyShort, ...videos]
    .filter((v, i, all) => (isLocal(v) || videoEmbed(v.url)) && !namedOtherLanguage.test(v.title) && all.findIndex(other => other.url === v.url) === i);
  const matches = (v: Video) => (category === "All" || v.category === category) && `${v.title} ${v.category}`.toLowerCase().includes(query.toLowerCase());
  const films = available.filter(v => !isShort(v) && matches(v));
  const shorts = available.filter(v => isShort(v) && matches(v));
  const categories = ["All", ...new Set(available.map(v => v.category))];
  const filtering = Boolean(query || category !== "All");
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: key === "q" });
  };
  function card(v: Video, portrait = false) {
    return <button key={v.id} className={`${styles.card} ${portrait ? styles.shortCard : ""}`} aria-label={`Play ${v.title}`} onClick={e => { e.currentTarget.focus(); setActive(v); track("video_open", { video_id: v.id }); }}>
      <span className={styles.thumbnail}><PictureView picture={v.thumbnail} /><span className={styles.play} aria-hidden="true"><Play size={22} fill="currentColor" /></span></span>
      <strong>{v.title}</strong><span className={styles.metadata}>iDance · {v.category}</span>
    </button>;
  }
  const shortsSection = <section className={styles.shorts} aria-labelledby="shorts-heading">
    <div className={styles.sectionHeading}><h2 id="shorts-heading"><Zap aria-hidden="true" fill="currentColor" /> Shorts</h2>{view === "home" && <Link to="?view=shorts">View Shorts <ArrowUpRight size={16} /></Link>}</div>
    {shorts.length ? <div className={styles.shortRail}>{shorts.map(v => card(v, true))}</div> : <p className={styles.empty}>No Shorts match your search.</p>}
  </section>;
  return <section className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}><a className={styles.channel} href="https://www.youtube.com/@idanceaudiocom" target="_blank" rel="noopener noreferrer">YouTube channel <ArrowUpRight size={17} /></a></header>
      <nav className={styles.navigation} aria-label="iDance TV sections">{([['home', 'Home'], ['videos', 'Videos'], ['shorts', 'Shorts']] as const).map(([key, label]) => <Link key={key} to={key === 'home' ? '/tv' : `?view=${key}`} aria-current={view === key ? 'page' : undefined}>{label}</Link>)}</nav>
      <div className={styles.toolbar}><div className={styles.filters} aria-label="Filter by category">{categories.map(c => <button key={c} aria-pressed={category === c} onClick={() => update('category', c === 'All' ? '' : c)}>{c}</button>)}</div><label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" aria-label="Search iDance TV" placeholder="Search videos" value={query} onChange={e => update('q', e.target.value)} /></label></div>
      {filtering && <p className={styles.results} role="status">{(view === 'shorts' ? shorts : view === 'videos' ? films : [...films, ...shorts]).length} results <button onClick={() => setParams(view === 'home' ? {} : { view })}>Clear filters</button></p>}
      {view !== 'shorts' && <section aria-labelledby="films-heading"><div className={styles.sectionHeading}><h2 id="films-heading">{view === 'home' && !filtering ? 'Featured videos' : 'Videos'}</h2>{view === 'home' && <Link to="?view=videos">View all <ArrowUpRight size={16} /></Link>}</div><div className={styles.grid}>{(view === 'home' && !filtering ? films.slice(0,3) : films).map(v => card(v))}</div>{!films.length && <p className={styles.empty}>No videos match your search.</p>}</section>}
      {view !== 'videos' && shortsSection}
      {view === 'home' && !filtering && films.length > 3 && <section className={styles.more} aria-labelledby="more-heading"><div className={styles.sectionHeading}><h2 id="more-heading">More from iDance</h2></div><div className={styles.grid}>{films.slice(3).map(v => card(v))}</div></section>}
      {active && <Modal className={`${styles.playerModal} ${isShort(active) ? styles.portraitModal : ''}`} title={active.title} onClose={() => setActive(null)}>
        {isLocal(active) ? <video className="video-player" src={active.url} controls autoPlay playsInline aria-label={`${active.title} film`} /> : <iframe className="video-player" src={videoEmbed(active.url)!} title={active.title} allow="autoplay; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
        {!isLocal(active) && <p className={styles.externalNote}>YouTube playback is subject to channel availability. <a href={active.url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>}
      </Modal>}
    </div>
  </section>;
}
