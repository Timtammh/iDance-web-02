import { useState } from "react";
import styles from "./VideoGrid.module.css";
import { Play, ArrowUpRight } from "lucide-react";
import { Modal } from "./Modal";
import { PictureView } from "./ContentCards";
import type { Video } from "../../types/content";
import { companyVideos } from "../../data/companyVideos";
import { track } from "../../lib/analytics";
export function videoEmbed(raw?: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (["www.youtube.com", "youtube.com", "youtu.be"].includes(u.hostname)) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.pathname.startsWith("/shorts/")
            ? u.pathname.split("/")[2]
            : u.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
        : null;
    }
    if (
      ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
      /^\/\d+$/.test(u.pathname)
    )
      return `https://player.vimeo.com/video${u.pathname}?autoplay=1`;
    return null;
  } catch {
    return null;
  }
}
export function VideoGrid({ videos, variant = "library" }: { videos: Video[]; variant?: "library" | "home" }) {
  const [active, setActive] = useState<Video | null>(null);
  const available: Video[] = [
    { id: "film-xd301", title: "XD301", category: "Portable DJ station", url: "/media/XD301_EN_10MB.mp4", thumbnail: { url: "/media/xd301-colour-hero.png", alt: "XD301 portable DJ station" } },
    { id: "film-djx101e", title: "DJX101E", category: "Karaoke party system", url: "/media/DJX101EV2-10MB.mp4", thumbnail: { url: "/media/djx101ev2-poster.jpg", alt: "DJX101E karaoke party system" } },
    ...(variant === "home" ? [] : [...companyVideos, ...videos.filter(v => videoEmbed(v.url) && !companyVideos.some(item => item.url === v.url))]),
  ];
  const groups = ["News", "DEEJAY", "Instruments", "Karaoke", "Pocket", "Interactive"];
  const filmCategory = (v: Video) => {
    if (v.id === "film-xd301") return "DEEJAY";
    if (v.id === "film-djx101e") return "Karaoke";
    const category = v.category.toLowerCase();
    if (/news/.test(category)) return "News";
    if (/deejay|dj|mix/.test(category)) return "DEEJAY";
    if (/instrument|keyboard|guitar|drum/.test(category)) return "Instruments";
    if (/karaoke/.test(category)) return "Karaoke";
    if (/pocket/.test(category)) return "Pocket";
    if (/interactive/.test(category)) return "Interactive";
    return undefined;
  };
  const rows = variant === "home" ? [{ title: "Watch now", films: available, playable: true }] : groups.map(title => ({ title, films: title === "News" ? available.filter(v => ["yt-uK7bgjejtJk", "yt-FnSatxEMFYw", "yt-owtNCxhhhKA"].includes(v.id)) : available.filter(v => filmCategory(v) === title), playable: true }));
  const localVideo = (v: Video) => v.url?.startsWith("/media/") && v.url.endsWith(".mp4");
  return (
    <div className={`${styles.library} ${variant === "home" ? styles.home : ""}`}>
      {rows.map(row => (
        <section className={styles.collection} key={row.title} aria-label={row.title}>
          <div className={styles.rowTitle}><h2>{row.title}</h2><span>{row.films.length} {row.playable ? (row.films.length === 1 ? "film" : "films") : "previews"}</span></div>
          {variant === "library" && row.title === "News" && <p className={styles.newsNote}>Latest product films from iDance</p>}
          {!row.films.length && <p className={styles.empty}>No videos available yet</p>}
          <div className={styles.rail} data-home-video-rail={variant === "home" || undefined} tabIndex={0} role="region" aria-label={`${row.title} films, scroll horizontally to browse`}>
            {row.films.map(v => <button className={styles.poster} data-home-video-card={variant === "home" || undefined} key={v.id} disabled={!row.playable} aria-label={row.playable ? `Play ${v.title}` : `${v.title}, coming soon`} onClick={e => { e.currentTarget.focus(); setActive(v); track("video_open", { video_id: v.id }); }}>
              <PictureView picture={v.thumbnail} />
              <span className={styles.brand}>iDance TV</span>
              {row.playable && <span className={styles.play} aria-hidden="true"><Play size={23} fill="currentColor" />{variant === "library" && <i className={styles.beatMark}/>}</span>}
              <span className={styles.caption}><small>{row.playable ? v.category : "COMING SOON"}</small><strong>{v.title}</strong><span>{row.playable ? <>{localVideo(v) ? "Watch film" : "Play on YouTube"} <ArrowUpRight size={15}/></> : "Preview"}</span></span>
            </button>)}
          </div>
        </section>
      ))}
      {active && <Modal className={!localVideo(active) ? styles.youtubeModal : undefined} title={active.title} onClose={() => setActive(null)}>
        {localVideo(active) ? <video className="video-player" src={active.url} controls autoPlay playsInline preload="metadata" aria-label={`${active.title} film`} /> : <iframe className="video-player" src={videoEmbed(active.url)!} title={active.title} allow="autoplay; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
      {!localVideo(active) && <p className={styles.externalNote}>YouTube playback is subject to the channel’s availability. <a href={active.url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>}
      </Modal>}
    </div>
  );
}
