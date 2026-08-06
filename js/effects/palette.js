/**
 * Membaca warna aksen dari CSS custom properties, supaya efek visual
 * (confetti, balon) selalu sinkron dengan palet warna di variables.css
 * tanpa perlu hardcode hex code dua kali di tempat berbeda.
 */

const FALLBACK_COLORS = ["#e8829f", "#f5b8c9", "#e3c17e"];

export function getThemeColors() {
  const styles = getComputedStyle(document.documentElement);

  const colors = [
    styles.getPropertyValue("--color-accent-primary").trim(),
    styles.getPropertyValue("--color-accent-primary-soft").trim(),
    styles.getPropertyValue("--color-accent-secondary").trim(),
  ].filter(Boolean);

  return colors.length > 0 ? colors : FALLBACK_COLORS;
}
