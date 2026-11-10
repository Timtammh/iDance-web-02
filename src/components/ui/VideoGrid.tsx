import { useState } from "react";
import styles from "./VideoGrid.module.css";
import { Play, ArrowUpRight } from "lucide-react";
import { Modal } from "./Modal";
import { PictureView } from "./ContentCards";
import type { Video } from "../../types/content";
import { track } from "../../lib/analytics";
export function videoEmbed(raw?: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (["www.youtube.com", "youtube.com", "youtu.be"].includes(u.hostname)) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
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
    ...videos.filter(v => videoEmbed(v.url)),
  ];
  const upcoming = videos.filter(v => !videoEmbed(v.url));
  const localVideo = (v: Video) => v.url?.startsWith("/media/") && v.url.endsWith(".mp4");
  return (
    <div className={`${styles.library} ${variant === "home" ? styles.home : ""}`}>
      {[{ title: "Watch now", films: available, playable: true }, { title: "Coming soon", films: upcoming, playable: false }].filter(row => row.films.length && (variant !== "home" || row.playable)).map(row => (
        <section className={styles.collection} key={row.title} aria-label={row.title}>
          <div className={styles.rowTitle}><h2>{row.title}</h2><span>{row.films.length} {row.playable ? "films" : "previews"}</span></div>
          <div className={styles.rail} data-home-video-rail={variant === "home" || undefined} tabIndex={0} role="region" aria-label={`${row.title} films, scroll horizontally to browse`}>
            {row.films.map(v => <button className={styles.poster} data-home-video-card={variant === "home" || undefined} key={v.id} disabled={!row.playable} aria-label={row.playable ? `Play ${v.title}` : `${v.title}, coming soon`} onClick={e => { e.currentTarget.focus(); setActive(v); track("video_open", { video_id: v.id }); }}>
              <PictureView picture={v.thumbnail} />
              <span className={styles.brand}>iDance TV</span>
              {row.playable && <span className={styles.play}><Play size={23} fill="currentColor" /></span>}
              <span className={styles.caption}><small>{row.playable ? v.category : "COMING SOON"}</small><strong>{v.title}</strong><span>{row.playable ? <>Watch film <ArrowUpRight size={15}/></> : "Preview"}</span></span>
            </button>)}
          </div>
        </section>
      ))}
      {active && <Modal title={active.title} onClose={() => setActive(null)}>
        {localVideo(active) ? <video className="video-player" src={active.url} controls autoPlay playsInline preload="metadata" aria-label={`${active.title} film`} /> : <iframe className="video-player" src={videoEmbed(active.url)!} title={active.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />}
      </Modal>}
    </div>
  );
}
