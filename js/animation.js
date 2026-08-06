/**
 * Animation Utilities
 * -------------------
 * Kumpulan helper animasi berbasis JS (bukan CSS keyframes) yang
 * dipakai lintas scene, terutama efek mengetik. Dipisah dari logic
 * scene supaya bisa dipakai ulang di Scene Welcome, Talking Photo,
 * dan Letter tanpa duplikasi kode.
 */

const DEFAULT_TYPE_SPEED_MS = 45;
const DEFAULT_PAUSE_MS = 1400;

/**
 * Delay berbasis Promise. Dipakai sebagai jeda baca antar baris.
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mengetik satu baris teks karakter demi karakter ke dalam elemen.
 * Menampilkan kursor berkedip selama proses mengetik.
 *
 * @param {HTMLElement} element
 * @param {string} text
 * @param {number} speed - ms per karakter
 * @returns {Promise<void>}
 */
export function typeText(element, text, speed = DEFAULT_TYPE_SPEED_MS) {
  return new Promise((resolve) => {
    element.textContent = "";

    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    cursor.setAttribute("aria-hidden", "true");
    element.appendChild(cursor);

    let charIndex = 0;

    const typeNextChar = () => {
      if (charIndex < text.length) {
        cursor.insertAdjacentText("beforebegin", text[charIndex]);
        charIndex += 1;
        setTimeout(typeNextChar, speed);
      } else {
        cursor.remove();
        resolve();
      }
    };

    typeNextChar();
  });
}

/**
 * Mengetik beberapa baris secara berurutan, dengan jeda baca
 * di antara tiap baris. Baris sebelumnya otomatis dibersihkan.
 *
 * @param {HTMLElement} element
 * @param {string[]} lines
 * @param {{ typeSpeed?: number, pauseBetween?: number }} options
 * @returns {Promise<void>}
 */
export async function typeSequence(element, lines, options = {}) {
  const { typeSpeed = DEFAULT_TYPE_SPEED_MS, pauseBetween = DEFAULT_PAUSE_MS } = options;

  for (const line of lines) {
    await typeText(element, line, typeSpeed);
    await wait(pauseBetween);
  }
}
