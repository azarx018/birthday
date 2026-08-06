# PROJECT STATE — Birthday Memories (Rizka)

> **Untuk AI/asisten mana pun yang melanjutkan project ini:** baca file ini SEBELUM
> menulis kode apa pun. Ini sumber kebenaran tunggal soal keputusan desain,
> konvensi, dan progress sejauh ini. Kalau ada instruksi baru dari user yang
> bertentangan dengan file ini, ikuti instruksi baru DAN update file ini.

---

## 1. Ringkasan Project

Website ulang tahun interaktif untuk **Rizka**, dibuat sebagai hadiah personal
oleh pasangannya. Bukan landing page/portfolio — ini pengalaman storytelling
linear, satu scene fullscreen satu emosi, mobile-first (360–412px).

Filosofi: warm, minimal, elegant, soft, playful. Hindari tampilan ramai/generik/
AI-template. Detail kecil (timing, jeda, transisi halus) adalah prioritas.

**Constraint tetap:** HTML5 + CSS3 + Vanilla JS ES Modules. Tidak ada React/Vue/
Angular/Bootstrap. Library kecil boleh (canvas-confetti sudah dipakai).

---

## 2. Design Tokens (sumber: `css/variables.css`)

**Jangan hardcode warna/ukuran di file lain — selalu pakai token ini.**

| Token | Nilai | Kegunaan |
|---|---|---|
| `--color-bg-dark` | `#2b1620` (deep plum) | background scene gelap |
| `--color-bg-dark-soft` | `#3a2029` | variasi gelap (card, dsb) |
| `--color-bg-light` | `#fff5f7` | background scene terang |
| `--color-bg-light-soft` | `#fbe6ec` | variasi terang |
| `--color-text-on-dark` / `-muted` | `#f9eef1` / `#cfa9b3` | teks di atas bg gelap |
| `--color-text-on-light` / `-muted` | `#3a2029` / `#8a6a72` | teks di atas bg terang |
| `--color-accent-primary` | `#e8829f` (rose pink) | **warna utama** — tombol, highlight |
| `--color-accent-primary-soft` | `#f5b8c9` | variasi pink lebih lembut |
| `--color-accent-secondary` | `#e3c17e` (gold) | aksen sekunder tipis (sparkle, bintang) |
| `--color-bg-purple` / `-cream` / `-blue-deep` / `--color-paper` | lihat variables.css | **Polish 1:** palet atmosfer tambahan, disiapkan untuk identitas gradient per-scene (belum diterapkan ke scene manapun) |
| `--radius-sm/md/lg/pill` | `12px / 20px / 28px / 999px` | **Polish 1:** skala radius konsisten (cta-button sudah pakai `--radius-pill`) |
| `--shadow-sm/md/lg` / `--shadow-glow-primary` | lihat variables.css | **Polish 1:** shadow warm-tinted (dari `--color-bg-dark`, bukan hitam murni) |
| `--ambient-*` | lihat variables.css | **Polish 1:** rentang ukuran/durasi/opacity untuk `js/effects/ambient.js` |

**Font:**
- `--font-display`: **Fredoka** (rounded, playful) — dipakai semua heading/judul besar
- `--font-base`: **Quicksand** (soft, readable) — dipakai body text/paragraf
- Di-load dari Google Fonts CDN di `index.html` (belum di-self-host — lihat §7 Utang Teknis)

**Motion:**
- Durasi: `--duration-fast` 300ms, `--duration-base` 500ms, `--duration-slow` 700ms, `--duration-slower` 1000ms
- Easing custom: `--ease-out-soft`, `--ease-in-out-soft` (cubic-bezier, bukan `ease` default — biar cinematic)
- **Prinsip:** `prefers-reduced-motion` SENGAJA TIDAK dihormati di project ini (keputusan eksplisit user) — semua animasi selalu jalan penuh di semua device.

**Spacing scale:** `--space-2xs` (0.25rem) sampai `--space-2xl` (4.5rem), lihat variables.css untuk nilai lengkap.

---

## 3. Data Personalisasi (sumber: `js/config.js`)

```js
export const RECIPIENT_NAME = "Rizka";
export const FRIENDSHIP_YEARS = 1; // TODO: user belum konfirmasi angka asli
export const SENDER_NAME = "Azhar";
export const FRIENDSHIP_START_DATE = new Date(2024, 9, 30, 20, 0, 0); // 30 Okt 2024, 20:00 — dikonfirmasi user, dipakai Scene 13
```

**Semua scene yang butuh nama/data personal HARUS import dari sini, jangan hardcode ulang.**

---

## 4. Arsitektur & Konvensi Kode

### 4.1 Scene Lifecycle (pola WAJIB untuk semua scene baru)

Setiap scene adalah modul di `js/scene/scene-*.js` yang export satu factory
function, mengembalikan `{ onEnter, onExit }`:

```js
export function createXxxScene({ onFinished } = {}) {
  // ambil referensi DOM sekali di sini (bukan di onEnter)
  return {
    onEnter() { /* mulai animasi/listener */ },
    onExit()  { /* cleanup listener/timer */ },
  };
}
```

Didaftarkan di `main.js` lewat `registerScene(id, createXxxScene({ ... }))`,
lalu perpindahan pakai `goToScene(id)`. Lihat `js/router.js` — jangan diubah
polanya, semua scene sejauh ini konsisten pakai ini.

**Elemen HTML scene** harus `<section id="scene-xxx" class="scene scene-xxx">`
— class `.scene` (dari `css/scene.css`) yang atur toggle `.is-active`.

### 4.2 Alur transisi antar scene

Scene TIDAK pindah otomatis kecuali secara eksplisit di-desain begitu (typing
selesai, dst). Kalau scene butuh input user buat lanjut, pakai tombol dengan
class shared `.cta-button .cta-button--fade`, ditambah `.is-visible` lewat JS
saat kondisi lanjut terpenuhi. Lihat contoh di `scene-fun-memories.js` atau
`scene-stars.js`.

### 4.3 Data terpisah dari logic

Konten yang panjang/berulang (cerita, achievement, kenangan) selalu di
`js/data/*.js`, bukan hardcode di scene file. Pola: array of object + komentar
jelas field mana yang harus diisi user.

### 4.4 Efek visual reusable

`js/effects/` isinya modul efek yang dipakai lintas scene (confetti, balon,
palette warna). `js/effects/palette.js` baca warna dari CSS variable secara
runtime (`getComputedStyle`) — jangan hardcode hex color kedua kalinya di JS.

**Polish 1:** tambah `js/effects/ambient.js` — `createAmbientLayer(container, options)`
mengembalikan `{ mount(), destroy() }`, dipanggil dari `onEnter`/`onExit` scene
(pola sama seperti lifecycle §4.1). Menghasilkan lapisan sparkle/glow dekoratif
(`.ambient-layer` di `css/ambient.css`), warna ambil dari `getThemeColors()`.
**Belum dipasang di scene manapun** — modul siap pakai, penerapan per-scene
menyusul di Polish berikutnya.

### 4.5 Animasi teks (typewriter)

`js/animation.js` punya `typeText()` dan `typeSequence()` — reusable, dipakai
di Welcome & Gift Box. Pakai ini lagi untuk scene lain yang butuh efek ketik
(Letter, Talking Photo), jangan bikin ulang.

### 4.6 Keyframe CSS

Semua `@keyframes` terpusat di `css/animations.css`, bukan di file scene
masing-masing — walau cuma dipakai satu scene, taruh di sana biar satu tempat
rujukan.

### 4.7 IntersectionObserver

Kalau butuh trigger animasi berdasarkan scroll posisi (contoh: Memory Timeline),
scope observer ke `root: <container scroll-nya sendiri>`, BUKAN default
viewport — karena semua scene saling tumpuk secara geometris (position:
absolute inset:0), observer dengan root default akan salah trigger.

### 4.8 Naming

- File CSS scene: `css/scene/scene-<nama>.css`
- File JS scene: `js/scene/scene-<nama>.js`
- Class BEM-ish: `.scene-<nama>__<bagian>`, modifier `.is-<state>`

---

## 5. Struktur Folder Saat Ini

```
birthday/
├── index.html
├── README.md
├── PROJECT_STATE.md
├── POLISH_LOG.md      (laporan tiap sprint UI/UX Polish — mulai Polish 1)
├── css/
│   ├── variables.css / reset.css / global.css / animations.css / scene.css
│   ├── ambient.css        (Polish 1 — style lapisan sparkle/glow reusable)
│   └── scene/
│       ├── scene-preloader.css
│       ├── scene-welcome.css
│       ├── scene-birthday.css
│       ├── scene-gift.css
│       ├── scene-memory.css
│       ├── scene-fun-memories.css
│       ├── scene-stars.css
│       ├── scene-quiz.css
│       ├── scene-video.css
│       ├── scene-call.css
│       ├── scene-talking-photo.css
│       ├── scene-letter.css
│       ├── scene-final-gift.css
│       ├── scene-ending.css
│       ├── scene-photobooth.css
│       └── scene-scrapbook.css
├── js/
│   ├── main.js            (entry point, registrasi semua scene)
│   ├── router.js          (scene controller: registerScene/goToScene)
│   ├── animation.js        (typewriter utility)
│   ├── date-format.js      (formatIndonesianDate, dipakai Photo Booth & Scrapbook)
│   ├── config.js           (data personalisasi)
│   ├── preload.js          (preload asset generic)
│   ├── asset-manifest.js   (daftar asset wajib preload — masih kosong)
│   ├── state/
│   │   ├── session-photo.js       (in-memory, oper foto Photo Booth → Scrapbook)
│   │   └── photobooth-layout.js   (in-memory, persist layout terpilih selama sesi)
│   ├── data/
│   │   ├── memory-data.js       (5 foto cerita + 10 galeri)
│   │   ├── achievements-data.js (3 achievement)
│   │   ├── stars-data.js        (7 kenangan bintang)
│   │   ├── quiz-data.js         (5 soal + komentar skor, MASIH DUMMY)
│   │   ├── talking-photo-data.js (subtitle Scene 10, teks & timestamp MASIH PLACEHOLDER)
│   │   ├── letter-data.js        (paragraf surat Scene 11, MASIH PLACEHOLDER)
│   │   ├── photobooth-data.js    (teks intro/error/share + template pesan WhatsApp Scene 14)
│   │   └── photobooth-layouts.js (registry 3 layout Photo Booth — single/triple/korean-six)
│   ├── effects/
│   │   ├── palette.js          (baca warna tema dari CSS var)
│   │   ├── confetti-effects.js (confetti, firework, glow burst)
│   │   ├── balloons.js
│   │   └── ambient.js          (Polish 1 — lapisan sparkle/glow reusable, belum dipasang di scene)
│   └── scene/
│       ├── scene-preloader.js
│       ├── scene-welcome.js
│       ├── scene-birthday.js
│       ├── scene-gift.js
│       ├── scene-memory.js
│       ├── scene-fun-memories.js
│       ├── scene-stars.js
│       ├── scene-quiz.js
│       ├── scene-video.js         (hanya urus pemutaran video, sudah tidak ada logic telepon)
│       ├── scene-call.js          (Scene 9: incoming call full-screen, decline loop tanpa batas)
│       ├── scene-talking-photo.js (Scene 10: foto hidup, blink acak + crossfade mingkem/mangap reaktif audio)
│       ├── scene-letter.js        (Scene 11: surat, typewriter per paragraf + auto-scroll pelan)
│       ├── scene-final-gift.js    (Scene 12: thanks text lalu reuse confetti/firework/balon Scene 2)
│       ├── scene-ending.js        (Scene 13: statistik live hari/jam/menit dari FRIENDSHIP_START_DATE)
│       ├── scene-photobooth.js    (Scene 14: state machine kamera+frame+capture+download+share WA)
│       └── scene-scrapbook.js     (Scene 15: foto tape-in + halaman lama + closing + ending + restart)
└── assets/
    ├── icons/ (favicon.png dibutuhkan, + 3 SVG achievement sudah ada)
    ├── images/memories/  (memory-1.jpg s/d memory-5.jpg)
    ├── images/gallery/   (gallery-1.jpg s/d gallery-10.jpg)
    ├── images/stars/     (star-1.jpg, star-5.jpg)
    ├── videos/stars/     (star-3.mp4, star-7.mp4)
    ├── videos/message.mp4 (video pesan Scene 8, PORTRAIT)
    ├── audio/stars/      (star-4.mp3)
    ├── images/sender-avatar.jpg (foto Azhar untuk Scene 9/call screen, SUDAH ADA)
    ├── images/sender-avatar-mingkem.jpg (foto mulut tertutup, Scene 10 — BELUM ADA)
    ├── images/sender-avatar-mangap.jpg (foto mulut terbuka, Scene 10 — BELUM ADA)
    ├── audio/message.mp3 (rekaman suara Scene 10 — BELUM ADA, lihat §7)
    ├── images/photobooth/frame-sakura.png (frame Photo Booth Scene 14, HARUS PNG transparan — BELUM ADA, lihat §7.8)
    └── lottie/ (belum dipakai)
```

---

## 6. Progress Scene (per brief asli di MAIN_PROJECT)

| # | Scene | Status | Catatan |
|---|---|---|---|
| 0 | Preloader | ✅ Selesai | |
| 1 | Welcome | ✅ Selesai | typing effect, nama dari config.js |
| 2 | Happy Birthday | ✅ Selesai | confetti + firework + balon custom |
| 3 | Gift Box | ✅ Selesai | pure CSS shape, tap to open |
| 4 | Memory Timeline | ✅ Selesai | swipe horizontal, 5 foto cerita + galeri 10 foto |
| 5 | Fun Memories | ✅ Selesai | 3 achievement, tap to unlock |
| 6 | Memory Stars | ✅ Selesai | 7 bintang interaktif, card modal (foto/teks/video/voice) |
| 7 | Quiz | ✅ Selesai | 5 soal (masih dummy), submit di akhir, skor + breakdown |
| 8 | Video Message | ✅ Selesai | digabung dengan mekanisme inti Scene 9 (lihat catatan) |
| 9 | Phone Call | ✅ Selesai | scene terpisah (`scene-call.js` / `scene-call.css`), full-screen incoming-call takeover dengan avatar berdenyut (ring pulse), accept/decline loop tanpa batas + chat nag. Ringtone SENGAJA ditunda ke sprint Audio System khusus (keputusan user) |
| 10 | Talking Photo | 🔶 Sebagian (kode siap, menunggu 2 foto + audio asli) | `scene-talking-photo.js`/`.css`. Simplifikasi dari clip-path jadi **2 foto** (mingkem/mangap) yang di-crossfade berdasar volume audio real-time (Web Audio API AnalyserNode), foto TIDAK muncul sebelum audio benar-benar bersuara, mingkem=redup mangap=terang, denyut scale 1x tiap mulai bicara. Blink acak tetap sama (kalibrasi lihat §7.7). Subtitle sinkron timestamp (masih placeholder, lihat §7.6) |
| 11 | Letter | ✅ Selesai (isi surat masih placeholder) | `scene-letter.js`/`.css`. Background terang (mood shift dari scene gelap sebelumnya). Paragraf diketik satu-satu (elemen baru tiap paragraf, bukan menimpa), auto-scroll pelan mengikuti progress ketikan tapi jeda otomatis kalau user sentuh/scroll manual. Tombol "Lanjut" muncul setelah semua paragraf & tanda tangan selesai. Musik piano BGM SENGAJA ditunda ke sprint Audio System (keputusan user, sama seperti ringtone) |
| 12 | Final Gift | ✅ Selesai | `scene-final-gift.js`/`.css`. Teks "Terima kasih..." diketik pelan, lalu reuse persis effects Scene 2 (`fireConfettiBurst`, `fireFireworkBursts`, `spawnBalloons`) — tidak ada duplikasi kode confetti/balon. Tombol "Lanjut" muncul ~2.6 detik setelah perayaan mulai |
| 13 | Ending (statistik hari/jam/menit) | ✅ Selesai | `scene-ending.js`/`.css`. Dihitung dari `FRIENDSHIP_START_DATE` (30 Okt 2024, 20:00 — konfirmasi user) di `config.js`. Count-up animasi ~1.2 detik lalu lanjut live-ticking tiap detik (menit beneran jalan selama scene aktif), diikuti pesan penutup & tombol "Lanjut" |
| 14 | ~~Credits~~ → **Photo Booth** | ✅ Selesai (kode) | Scene 14 & 15 lama (Credits, Secret Ending) **DIGANTI TOTAL** oleh user dengan spek baru "Birthday Photo Booth & Final Scrapbook" (lihat §9). Semua 4 bagian (13A-13D) sudah selesai secara kode, menunggu asset frame PNG |
| 15 | ~~Secret Ending~~ → **Final Scrapbook** | ✅ Selesai | lihat §9 (13C & 13D sudah selesai) |
| — | Audio system (`audio.js`, BGM per scene) | ⬜ Belum | sengaja ditunda, akan digabung jadi 1 sprint khusus |
| — | PWA & Deployment | ⬜ Belum | |
| — | Performance/Lighthouse polish | ⬜ Belum | |

---

## 7. Utang Teknis / Hal yang Belum Ideal (jangan lupa)

1. **Font Google Fonts via CDN** — belum di-self-host. Perlu diperbaiki di
   sprint optimasi performa (target Lighthouse >90).
2. **canvas-confetti di-import dari CDN jsdelivr** (`js/effects/confetti-effects.js`)
   — butuh koneksi internet saat runtime. Idealnya di-self-host juga nanti.
3. **`FRIENDSHIP_YEARS` di config.js masih default `1`** — user belum konfirmasi
   angka asli.
4. **Beberapa konten masih placeholder**, harus diisi user (jangan diisi asal
   oleh AI manapun — ini konten personal, bukan hal yang boleh dikarang):
   - `js/data/memory-data.js` — caption foto ke-2 s/d ke-5
   - `js/data/achievements-data.js` — deskripsi "Si Boros" & "Si Cantik"
   - `js/data/stars-data.js` — semua teks kenangan (`[Isi ...]`)
   - `js/data/quiz-data.js` — **seluruh isi masih dummy** (5 soal + komentar skor
     selain 5/5), user sudah eksplisit minta dummy dulu, ganti belakangan
   - `js/data/letter-data.js` — **seluruh paragraf surat masih placeholder**
     (`[Isi paragraf ...]`), user sudah eksplisit minta placeholder dulu, ganti
     belakangan
   - Semua file foto/video/audio di `assets/` (belum ada satupun yang diupload)
   - `assets/videos/message.mp4` — video pesan Scene 8, HARUS portrait
   - `assets/images/sender-avatar.jpg` — foto Azhar buat call screen Scene 9 (SUDAH ADA)
   - `assets/images/sender-avatar-mingkem.jpg` & `sender-avatar-mangap.jpg` — 2 foto
     buat Scene 10 (BELUM ADA, lihat §7.7)
   - `assets/icons/favicon.png` belum ada
5. ~~Scene 13 (Ending) butuh tanggal mulai hubungan~~ — **SUDAH resolved**,
   lihat `FRIENDSHIP_START_DATE` di §3.
6. **Ringtone Scene 9 & Piano BGM Scene 11** — user eksplisit minta keduanya
   ditunda ke sprint Audio System khusus (bukan belum sempat, tapi keputusan
   sadar, konsisten di 2 sprint berturut-turut). Saat sprint audio tiba, ingat
   untuk menambahkan elemen `<audio>` + play/pause-nya di `scene-call.js` dan
   `scene-letter.js` (onEnter/onExit), bukan bikin ulang dari nol.
7. **Scene 10 (Talking Photo) — didesain ulang jadi 2-foto (bukan clip-path lagi),
   4 hal menggantung:**
   1. `assets/images/sender-avatar-mingkem.jpg` (mulut tertutup) dan
      `assets/images/sender-avatar-mangap.jpg` (mulut terbuka) **belum ada** —
      ini 2 foto BARU, bukan reuse `sender-avatar.jpg` yang dipakai di Scene 9.
      Idealnya diambil dari posisi/jarak kamera yang sama biar pas di-crossfade.
   2. `assets/audio/message.mp3` **belum ada** — scene sudah siap teknis
      (Web Audio API AnalyserNode sudah pasang, tinggal file-nya ditaruh).
   3. `js/data/talking-photo-data.js` — teks subtitle MASIH PLACEHOLDER
      (`[Isi baris ...]`) dan `time` MASIH DUMMY (jarak rata 4 detik). Setelah
      `message.mp3` direkam: dengarkan sekali, catat detik mulai tiap kalimat,
      isi ulang field `time` (dan teksnya) — jangan dikarang oleh AI manapun.
   4. **Kalibrasi posisi mata** di `scene-talking-photo.css` (custom property
      `--tp-eye-*`) dihitung dari foto `sender-avatar.jpg` yang lama (upload
      pertama, wajah menghadap lurus ke kamera) — begitu
      `sender-avatar-mingkem.jpg` yang baru diupload, **minta AI cek ulang
      apakah framing-nya sama**; kalau beda, angka `--tp-eye-*` perlu dihitung
      ulang dari foto baru itu.
   5. **Threshold `SPEAKING_RMS_THRESHOLD`** di `scene-talking-photo.js` (nilai
      default `0.045`) itu tebakan — begitu `message.mp3` asli ada, coba dulu,
      kalau foto mangap ketarik terus/tidak pernah muncul, minta AI sesuaikan
      angkanya berdasar volume rekaman asli.
8. **Scene 14/15 (Photo Booth + Scrapbook) — semua bagian (13A-13D) SUDAH
   selesai secara kode**, 2 hal menggantung (update: teks tanggal via kode
   SUDAH DIHAPUS atas permintaan user — frame sekarang clean, semua teks
   termasuk tanggal harus jadi bagian dari artwork PNG itu sendiri):
   1. `assets/images/photobooth/frame-sakura.png` **belum ada** — HARUS `.png`
      (bukan `.jpg`) karena area fotonya harus transparan (alpha channel), kalau
      `.jpg` area foto bakal jadi warna solid, bukan transparan. Sampai file ini
      ada, Scene 14 di browser bakal error/gambar rusak pas capture (frame
      image nggak ke-load, `naturalWidth` = 0 bikin canvas gagal digambar).
   2. `getUserMedia()` butuh **HTTPS atau localhost** (kebijakan keamanan
      browser) — kalau dites dari `file://` langsung atau HTTP biasa, kamera
      akan selalu gagal walau izin diberikan. Pastikan pakai local server
      pas testing (sama seperti requirement ES Modules).
   3. Suara shutter kamera & musik piano ending SENGAJA ditunda ke sprint
      Audio System (konsisten dengan ringtone & piano surat) — efek
      flash+freeze visual tetap jalan tanpa suara dulu.
   4. Background meja kayu di Scrapbook masih CSS gradient (keputusan user,
      "cepat dulu") — kalau nanti ada foto/tekstur asli, tinggal ganti
      `background` di `.scene-scrapbook` (`scene-scrapbook.css`), tidak perlu
      ubah HTML/JS sama sekali.
   5. **Sprint 14upgrade SELESAI SEMUA (A-D)** — brief upgrade Photo Booth
      jadi multi-layout (1/3/6 foto), countdown, pose challenge, animasi
      generating, dan ending Scrapbook jadi Credits (bukan restart lagi),
      semua sudah dikerjakan. Detail lengkap di §9.1. Yang masih tersisa
      cuma soal ASSET (frame PNG per layout + kalibrasi ulang slot), bukan
      kode/logic lagi.

---

## 9. Fitur Baru: Photo Booth & Final Scrapbook (GANTI Scene 14/15 lama)

User mengganti total spek Scene 14 (Credits) & Scene 15 (Secret Ending) dengan
fitur baru "Birthday Photo Booth & Final Scrapbook". Sudah dipecah jadi 4
bagian kerja, SEMUA sudah selesai secara kode:

| Bagian | Isi | Status |
|---|---|---|
| **13A** | Intro teks, izin kamera, live preview + frame overlay, ambil foto (flash+freeze), composite ke canvas, preview (download/ambil ulang) | ✅ Selesai |
| **13B** | Dialog setelah download + WhatsApp redirect + tombol "Lanjutkan" | ✅ Selesai (satu file sama 13A, satu state machine) |
| **13C** | Scene Final Scrapbook: background meja kayu (CSS gradient), foto ditempel pakai tape + sticker emoji + tanggal otomatis, teks berjalan, reuse 3 foto dari `memory-data.js` sebagai "halaman lama" yang mengintip | ✅ Selesai |
| **13D** | Ending: scrapbook menutup (animasi scaleY), pesan penutup, tombol "Lihat Lagi Dari Awal" → balik ke Scene 1 (Welcome, skip preloader) | ✅ Selesai |

**File terkait (semua sudah ada):**
- `js/scene/scene-photobooth.js` + `css/scene/scene-photobooth.css` — state
  machine 6 panel (intro, camera, error, preview, share, continue)
- `js/scene/scene-scrapbook.js` + `css/scene/scene-scrapbook.css` — sequence
  linear (bukan state machine, karena tidak ada keputusan user di tengah)
- `js/data/photobooth-data.js` — teks intro, error kamera, dialog share,
  template pesan WhatsApp
- `js/state/session-photo.js` — module singleton in-memory (BUKAN
  localStorage/server) buat oper foto dari Photo Booth ke Scrapbook.
  Ownership object URL dipindah pas "Lanjutkan" diklik (lihat komentar di
  `handleContinueClick`), supaya `onExit` Photo Booth tidak ikut me-revoke
  foto yang masih dipakai Scrapbook.
- `js/date-format.js` — util `formatIndonesianDate()`, dipakai Photo Booth
  (tanggal di foto) & Scrapbook (tanggal di halaman), biar tidak duplikat
- `config.js` — `GIFT_CREATOR_WHATSAPP_NUMBER = "6285701422878"` (dikonfirmasi
  user)

**Keputusan desain yang diambil (semua sudah dikonfirmasi user):**
- Kamera: depan/selfie (`facingMode: "user"`)
- Border/frame SELALU ikut ke-composite ke file yang didownload lewat
  `<canvas>`: video (crop "cover" + mirror) → frame PNG di atasnya (area
  transparan otomatis nampilin video) → teks tanggal digambar terakhir
- Tanggal di foto **otomatis** (hari pengambilan), bukan ter-bake statis
  di gambar frame. Judul "Happy Birthday Rizka" & caption gaya boleh tetap
  ter-bake di PNG karena statis per style
- Setelah pilih "Kirim ke Pembuat Kado" ATAU "Tidak Sekarang", tombol
  "Lanjutkan" langsung muncul (tidak ada cara andal deteksi "kembali dari
  WhatsApp" di browser)
- Suara shutter kamera & musik piano ending SENGAJA ditunda ke sprint Audio
  System (konsisten dengan ringtone & piano surat)
- Background meja kayu: CSS gradient dulu (keputusan user), bisa diganti
  foto/tekstur asli kapan saja tanpa ubah struktur HTML/JS
- "Halaman-halaman lama" di scrapbook: REUSE 3 foto pertama dari
  `memory-data.js` (bukan cuma teks/implikasi) — kalau `memory-data.js`
  nanti diisi foto asli, halaman lama di Scrapbook otomatis ikut update
- Restart ("Lihat Lagi Dari Awal") → `goToScene("scene-welcome")`, skip
  preloader (keputusan user)

### 9.1 Sprint 14upgrade — Photo Booth Premium Upgrade (SEDANG BERJALAN)

User memberi brief baru yang jauh lebih besar untuk Photo Booth, terinspirasi
"premium Korean-style Photo Booth" — mengubah dari 1-foto-saja jadi pilihan
layout (1/3/6 foto), countdown, pose challenge, animasi generating, ekspor
resolusi tinggi, dan ending Scrapbook berubah dari tombol restart jadi
Credits. Dipecah 4 bagian:

| Bagian | Isi | Status |
|---|---|---|
| **14upgrade.A** | Intro copy baru + Choose Layout screen (3 kartu data-driven) + registry layout + persist pilihan layout selama sesi | ✅ Selesai |
| **14upgrade.B** | Kamera multi-shot: progress indicator, countdown (3-2-1-📸), pose challenge acak, retake/continue per foto | ✅ Selesai |
| **14upgrade.C** | Animasi "Generating" (loading cinematic) + composite multi-slot (masukin tiap foto ke slot masing-masing di frame) + ekspor resolusi tinggi (1080×1920+) | ✅ Selesai |
| **14upgrade.D** | Update pesan share WhatsApp + ganti ending Scrapbook dari restart jadi Credits (Made with ❤️, tombol restart jadi link kecil) | ✅ Selesai |

**SPRINT 14upgrade SELESAI SEMUA (A-D).**

**File baru dari 14upgrade.A:**
- `js/data/photobooth-layouts.js` — registry 3 layout (`single`, `triple`,
  `korean-six`), tiap layout punya `photoCount`, `frameImage` (path
  placeholder), `slots` (posisi tiap foto dalam PERSEN, MASIH GRID RATA
  karena belum ada frame asli — wajib dikalibrasi ulang begitu asset final
  ada, sama seperti pola kalibrasi mata Scene 10)
- `js/state/photobooth-layout.js` — persist layout terpilih selama sesi

**Perubahan di file lama:**
- `scene-photobooth.js` — panel baru `layoutChoose` disisipkan setelah
  intro, kartu layout di-render dari registry (bukan hardcode HTML, biar
  "gampang tambah/ubah layout tanpa ubah logic" sesuai requirement brief).
  **Kode drawing teks tanggal DIHAPUS TOTAL** dari `drawComposite()` (frame
  sekarang "clean", semua teks wajib jadi bagian artwork PNG)
- `js/date-format.js` — `formatIndonesianDate` masih ada, TAPI SEKARANG
  CUMA DIPAKAI `scene-scrapbook.js` (bukan lagi photobooth), karena teks
  tanggal di foto sudah dihapus

**File baru dari 14upgrade.B:** (tidak ada file baru — semua di dalam
`scene-photobooth.js` yang sudah ada, plus penambahan `PHOTOBOOTH_POSE_PROMPTS`
di `photobooth-data.js`)

**Yang berubah di 14upgrade.B:**
- `scene-photobooth.js` dirombak total di bagian kamera: sekarang benar-benar
  loop sebanyak `layout.photoCount` (bukan bridge 1-foto lagi seperti
  14upgrade.A). Tiap shot: `prepareShot()` (progress + pose prompt acak) →
  tap "Ambil Foto" → `runCountdown()` (3-2-1-📸, tiap angka pop-in pakai
  keyframe `photobooth-countdown-pop`) → `captureRawShot()` (crop+mirror ke
  canvas 720px lebar, TANPA frame — cuma foto mentah) → panel `shotPreview`
  (Retake/Lanjut). Retake ulang shot yang sama, Lanjut simpan & lanjut ke
  shot berikutnya atau ke `composeFinalPreview()` kalau sudah semua
- Progress indicator "Foto X / N" tampil di 2 tempat (panel kamera & panel
  shotPreview), diupdate lewat satu fungsi `updateProgressIndicator()`
- `startCamera()` sekarang terima parameter `onSuccess` callback — dipakai
  supaya retry dari error state bisa LANJUT dari shot yang sedang berjalan
  (bukan ulang dari shot 1), kalau errornya kejadian di tengah sesi
- Tombol "Ambil Ulang Semua" (final preview) sekarang betulan mengulang
  SELURUH sesi shot dari awal (`startShotSequence()`), bukan cuma 1 foto

**File baru dari 14upgrade.C:** (tidak ada — semua di `scene-photobooth.js`
+ `PHOTOBOOTH_GENERATING_MESSAGES` baru di `photobooth-data.js`)

**Yang berubah di 14upgrade.C:**
- `composeFinalPreview()` DIROMBAK TOTAL — sekarang betulan loop
  `currentLayout.slots.forEach()`, tiap foto di `capturedShots[i]` digambar
  ke `slots[i]` masing-masing (crop "cover" per slot lewat helper baru
  `drawShotCover()`), BUKAN cuma foto terakhir lagi. Bridge sementara di
  14upgrade.B **sudah tidak berlaku**.
- Resolusi ekspor: canvas di-scale up ke minimal `MIN_EXPORT_WIDTH = 1080`px
  lebar (proporsional ke tinggi), sesuai rekomendasi brief 1080×1920+.
  Kamera diminta resolusi `1080×1440` (ideal, browser boleh kasih kurang
  kalau device tidak mendukung), tiap shot mentah disimpan di lebar 960px
  (naik dari 720px sebelumnya)
- Animasi "Generating" (4 pesan bergantian, tiap ±650ms, total ~2.6 detik
  sesuai rekomendasi brief "2-3 seconds") tampil setelah shot terakhir,
  SEBELUM hasil final dikomposit & ditampilkan — pakai `finalizePhotoBooth()`
  yang gabungin: stop kamera → animasi generating → compose → tampilkan

**Yang WAJIB dicek ulang begitu asset frame asli ada:**
`currentLayout.slots` di `photobooth-layouts.js` isinya MASIH grid rata
(pembagian sama besar), BUKAN posisi asli. Begitu frame PNG final untuk
tiap layout (single/triple/korean-six) sudah ada, WAJIB dikalibrasi ulang
persis seperti kalibrasi mata di Scene 10 — lihat posisi kotak putih/
transparan di tiap frame, hitung persentase x/y/width/height-nya, baru
update array `slots` di registry. Tanpa ini, foto akan salah posisi begitu
frame asli dipasang (karena bentuk aslinya pasti beda dari grid rata).

**File yang berubah dari 14upgrade.D:**
- `index.html` — di panel `scrapbook-ending`: tambah blok `.scrapbook__credits`
  (Made with ❤️ / by Azhar Firjatullah / for Rizka / v1.0 · 5 Agustus 2026,
  angka versi & tanggal dikonfirmasi user, DITULIS STATIS bukan otomatis),
  tombol restart ganti dari `.cta-button` jadi `.scrapbook__restart-link`
  (link kecil bergaris bawah, bukan tombol besar mencolok)
- `scene-scrapbook.js` — urutan reveal baru: pesan penutup (typeText) →
  jeda 1 detik → Credits fade in → jeda → restart link fade in. Semua
  reset di `resetScene()` sudah diupdate juga
- `scene-scrapbook.css` — style `.scrapbook__credits` & `.scrapbook__restart-link`
- Pesan share WhatsApp (`PHOTOBOOTH_SHARE_MESSAGE`) sudah diupdate sejak
  14upgrade.A, tidak ada perubahan lagi di sini

Fitur Photo Booth + Scrapbook sekarang FULL sesuai brief upgrade (multi-layout,
countdown, pose challenge, generating animation, multi-slot composite,
Credits). Yang masih tersisa cuma soal ASSET (frame PNG per layout + slot
recalibration) dan hal-hal umum project lain yang sudah tercatat di §7.

**Keputusan yang sudah dikonfirmasi user untuk bagian berikutnya:**
- Frame 6-kotak yang dilampirkan user = **referensi visual saja**, BUKAN
  asset final Layout C — asset transparan asli menyusul nanti
- Layout A & B pakai **placeholder generik** (kotak + border pink + label)
  sampai asset asli ada — SUDAH diimplementasikan lewat mini-preview CSS
  data-driven di kartu (`.photobooth__layout-card-preview`), bukan gambar
  asli
- Ending terakhir: **Credits dihidupkan lagi** (konsep dari Scene 14 lama
  sebelum diganti Photo Booth — Made with ❤️ by Azhar, for Rizka, versi,
  tanggal), tombol "Lihat Lagi Dari Awal" jadi link kecil di dalam Credits,
  BUKAN dihapus total — ini bagian dari 14upgrade.D, belum dikerjakan.
- Copy intro & pesan WhatsApp brief asli berbahasa Inggris — DITERJEMAHKAN
  ke Indonesia biar konsisten sama seluruh situs (keputusan AI, bukan
  instruksi eksplisit user, tapi konsisten sama semua teks lain di project)

---

## 10. Aturan Kerja dengan User (dari instruksi awal, jangan dilupakan)

- Selalu analisa dulu sebelum coding: scope, keputusan desain, potensi masalah.
- Jangan generate seluruh project sekaligus — satu sprint/scene per satu waktu.
- **Jangan pernah pakai lorem ipsum atau fake asset.** Kalau butuh konten/asset
  personal yang belum ada, gunakan placeholder yang JELAS ditandai (`[Isi ...]`,
  komentar `// TODO`) dan kasih tau user persis di mana harus mengisi/menaruh
  file — jangan mengarang cerita/data personal.
- Kalau ambigu dan butuh data personal (nama, tanggal, cerita), TANYA user,
  jangan asumsi.
- Setelah tiap sprint: sebutkan file yang dibuat/diubah, update struktur
  project, kasih cara test.
- Kode harus modular, nama variabel jelas, hindari duplikasi (lihat §4 untuk
  pola yang sudah mapan — pakai ulang, jangan reinvent).

---

## 11. UI/UX Polish Sprints

Sejak Agustus 2026, project sudah tidak menambah fitur/scene baru (brief
`MAIN_PROJECT`/`Birthday_Website_Sprints.md` selesai — lihat §6 & §9). Fokus
berikutnya HANYA polish UI/UX (`UI_UX_upgrade` brief), dipecah jadi sprint
kecil **Polish 1, Polish 2, dst**.

**Progress & detail tiap sprint polish dicatat di file terpisah:
`POLISH_LOG.md` — baca file itu, bukan di sini, sebelum lanjut kerja polish.**

