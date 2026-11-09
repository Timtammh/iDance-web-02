import styles from "./ProductHero.module.css";

export function ProductModelViewer() {
  return <div className={styles.viewer} data-hero-product role="region" aria-label="XD301 3D model placeholder">
    <span className={styles.loading} role="status">3D 模型暫未加入 · 3D model to be added</span>
  </div>;
}
