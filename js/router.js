/**
 * Scene Controller
 * ----------------
 * Pusat manajemen perpindahan antar scene. Setiap scene mendaftarkan
 * diri lewat registerScene(), lalu perpindahan dilakukan lewat
 * goToScene(). Modul ini sengaja tidak tahu apa-apa soal isi/logic
 * masing-masing scene — hanya mengatur kapan onEnter/onExit dipanggil
 * dan kapan class .is-active di-toggle.
 */

const scenes = new Map();
let currentSceneId = null;

/**
 * @param {string} id - harus sama dengan id elemen HTML scene tsb
 * @param {{ onEnter?: () => void, onExit?: () => void }} lifecycle
 */
export function registerScene(id, lifecycle = {}) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Scene Controller: elemen dengan id "${id}" tidak ditemukan.`);
  }

  scenes.set(id, { element, ...lifecycle });
}

/**
 * Pindah ke scene tujuan. Scene sebelumnya (jika ada) akan di-nonaktifkan.
 * @param {string} id
 */
export function goToScene(id) {
  const nextScene = scenes.get(id);

  if (!nextScene) {
    throw new Error(`Scene Controller: scene "${id}" belum terdaftar via registerScene().`);
  }

  if (currentSceneId && currentSceneId !== id) {
    const currentScene = scenes.get(currentSceneId);
    currentScene.element.classList.remove("is-active");
    currentScene.onExit?.();
  }

  nextScene.element.classList.add("is-active");
  currentSceneId = id;
  nextScene.onEnter?.();
}
