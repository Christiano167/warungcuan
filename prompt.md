Saya punya aplikasi Next.js bernama WarungCuan (POS app untuk warung sembako).
Stack: Next.js App Router + Tailwind CSS v4 + CSS Variables.

CSS Variables yang sudah ada di globals.css:
--sidebar: #1E2D3D
--accent: #2ECC9A
--accent-text: #1E2D3D
--bg: #F0F4F8
--card: #FFFFFF
--border: #D8E4EC
--text: #1E2D3D
--text-muted: #607080
--danger: #E05252
--danger-light: #FEF0F0

Sudah didaftarkan ke @theme Tailwind v4 sebagai:
bg-bg, bg-card, bg-accent, bg-danger, text-text, text-text-muted,
text-accent, text-danger, border-border, border-accent, dll.

Layout global: Sidebar kiri (fixed, slate gelap) + konten kanan (scrollable).

---

MASALAH YANG PERLU DIPERBAIKI (berdasarkan screenshot):

## 1. KASIR (src/app/kasir/page.tsx)

MASALAH:

- Card produk terlalu flat dan tipis (padding minimal, shadow gak ada)
- Search bar terlalu kecil dan pudar
- Panel keranjang kanan keliatan kosong dan gak berasa "penting"
- Tombol Bayar terlalu flat, gak berasa CTA utama

YANG DIINGINKAN:

- Setiap card produk punya padding vertikal lebih besar (min py-4), shadow tipis (shadow-sm), dan hover state yang jelas (hover:shadow-md hover:border-accent/40)
- Nama produk font-size lebih besar (text-base font-semibold), harga mint lebih besar (text-lg font-bold)
- Stok label lebih kecil dan muted, dengan badge kecil kalau stok < 5 (warna danger)
- Search bar lebih tinggi (h-11), border lebih tebal saat focus (focus:border-accent), ada icon search di dalam
- Panel keranjang: header "Keranjang" lebih bold dan berasa section tersendiri (border-bottom lebih tebal)
- Tombol Bayar harus jadi CTA yang dominan: tinggi min 48px, font-bold, dengan shadow ("shadow-md") saat enabled

## 2. DASHBOARD (src/app/dashboard/page.tsx)

MASALAH:

- Card metric terlalu kecil dan padding minimal
- Label atas angka (OMSET HARI INI, dll) terlalu kecil dan pudar
- Card Kekayaan Warung gak berasa premium
- Banyak ruang kosong di bawah
- Teks breakdown Cash/Stok/Piutang ada strikethrough yang aneh

YANG DIINGINKAN:

- Setiap card metric punya padding lebih besar (p-5 atau p-6), shadow-sm, dan rounded-xl
- Label di atas angka: text-xs font-semibold tracking-wider uppercase text-text-muted (lebih berasa "label professional")
- Angka utama tiap card: text-2xl font-bold (lebih besar dan dominan)
- Grid metric: 4 kolom di layar lebar (grid-cols-4), card Total Hutang span full width di bawahnya
- Card Kekayaan Warung: padding p-8, border-2 border-accent, shadow-lg, angka utama text-4xl font-black text-accent, ada subtle background gradient (from-card to-bg)
- Breakdown Cash/Stok/Piutang: tampilkan sebagai 3 mini-card horizontal di dalam card Kekayaan, bukan teks inline. Hapus strikethrough.
- Tambahkan greeting di atas Dashboard: "Selamat pagi, Warung Mama 👋" dengan tanggal hari ini

## 3. GLOBAL (berlaku semua halaman)

- Semua halaman: padding konten p-6 md:p-8, BUKAN max-w-md (terlalu sempit untuk tablet)
- Semua h1 judul halaman: text-2xl font-bold text-text mb-6
- Semua form input: h-11, rounded-lg, border-border, focus:border-accent focus:ring-1 focus:ring-accent/30, placeholder:text-text-muted/50
- Semua tombol primary: bg-accent text-accent-text font-bold rounded-lg h-11 shadow-sm hover:opacity-90 transition-all
- Semua tombol secondary/batal: border border-border text-text bg-transparent hover:bg-bg rounded-lg h-11
- Semua card/list item: bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-accent/30 transition-all
- JANGAN pakai max-w-md. Gunakan max-w-5xl atau full width dengan padding yang cukup.
- Hapus elemen kosong/lingkaran yang mungkin tersisa dari template default Next.js

## 4. KARAKTER VISUAL "WARUNG" yang perlu diangkat

Tambahkan elemen-elemen kecil yang bikin app berasa "untuk warung Indonesia", bukan generic SaaS:

- Di halaman Kasir, tambahkan chip/badge kategori produk (Sembako, Makanan, Minuman, Snack) di atas list produk sebagai filter cepat (UI only, belum harus fungsional)
- Di sidebar, tambahkan waktu real-time (jam) di bagian bawah sidebar (di atas "WarungCuan v1.0")
- Di Dashboard, greeting dengan nama warung dan emoji yang hangat

## PENTING - JANGAN DIUBAH:

- Logic/fungsi (state, Supabase query, business rules) JANGAN disentuh sama sekali
- Hanya ubah className, style, dan struktur JSX visual
- CSS Variables dan @theme sudah benar, jangan diubah
- File globals.css jangan diubah
- Sidebar.tsx boleh dimodifikasi untuk tambah jam real-time
