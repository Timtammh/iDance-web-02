import { productThumbnailSizing } from "../../data/productThumbnailSizing";
import styles from "./ProductFamilyNavigation.module.css";

/** Keep the original tile footprint while centering each visible product at a common scale. */
export function ProductThumbnail({ src, loading = "lazy" }: { src: string; loading?: "eager" | "lazy" }) {
  const sizing = productThumbnailSizing[src];
  return <span className={styles.photoSlot}><img src={src} alt="" loading={loading} style={sizing} /></span>;
}
