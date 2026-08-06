/**
 * Data Quiz (Scene 7).
 *
 * SEMUA ISI DI FILE INI MASIH DUMMY/PLACEHOLDER — sengaja dibuat generik
 * dulu biar strukturnya jalan, nanti diganti dengan soal & jawaban asli.
 *
 * question: teks pertanyaan
 * options: array pilihan jawaban (boleh 3-4 opsi)
 * correctIndex: index (mulai 0) dari options yang jadi jawaban benar
 */

export const quizQuestions = [
  {
    id: "q1",
    question: "[Dummy] Makanan favorit Rizka apa?",
    options: ["Nasi Goreng", "Mie Ayam", "Seblak", "Sushi"],
    correctIndex: 2,
  },
  {
    id: "q2",
    question: "[Dummy] Siapa yang duluan chat pertama kali?",
    options: ["Aku", "Rizka", "Kita bareng", "Lupa"],
    correctIndex: 0,
  },
  {
    id: "q3",
    question: "[Dummy] Warna favorit Rizka?",
    options: ["Pink", "Biru", "Hitam", "Putih"],
    correctIndex: 0,
  },
  {
    id: "q4",
    question: "[Dummy] Tempat nongkrong favorit kita berdua?",
    options: ["Kafe A", "Kafe B", "Rumah aja", "Mall"],
    correctIndex: 2,
  },
  {
    id: "q5",
    question: "[Dummy] Julukan paling sering dipanggil ke Rizka?",
    options: ["Sayang", "Cantik", "Beb", "Dek"],
    correctIndex: 1,
  },
];

/**
 * Komentar yang muncul di layar hasil, sesuai skor akhir (0-5 benar).
 * Ganti semua "[Ganti komentar ...]" dengan gaya bahasa kalian sendiri.
 */
export const scoreComments = {
  5: "Gelokkk gg beut kamuu!",
  4: "[Ganti komentar buat skor 4/5]",
  3: "[Ganti komentar buat skor 3/5]",
  2: "[Ganti komentar buat skor 2/5]",
  1: "[Ganti komentar buat skor 1/5]",
  0: "[Ganti komentar buat skor 0/5]",
};
