# Standardisasi Desain & Konsistensi UI/UX WarungCuan

Dokumen ini berisi rencana implementasi untuk menyelaraskan desain visual di seluruh aplikasi **WarungCuan**. Desain yang dirujuk adalah tema modern-dashboard dari halaman Kasir (`src/app/kasir/page.tsx`) dan Sidebar (`src/app/components/sidebar.tsx`) yang menggunakan CSS Variables yang bersih dan adaptif.

Rencana ini ditulis secara mendetail dalam format deskripsi **Git Issue #1** agar bisa langsung disalin atau di-create menggunakan Git CLI / GitHub CLI untuk dikerjakan oleh Junior AI coder.

---

## User Review Required

> [!IMPORTANT]
> **Refactoring Folder (Casing Mismatch)**
> Terdapat ketidakcocokan antara rute menu di `sidebar.tsx` dan nama folder fisik di repositori:
> - Rute `/barang-masuk` merujuk ke folder `BarangMasuk`
> - Rute `/stock-adjustment` merujuk ke folder `StockAdjustment`
>
> Di sistem Linux/Unix (seperti hosting production Vercel/Netlify), perbedaan casing ini menyebabkan halaman menghasilkan **Error 404 (Not Found)**. Oleh karena itu, rencana ini memasukkan langkah wajib untuk me-rename folder tersebut menjadi kebab-case:
> - `src/app/BarangMasuk` -> `src/app/barang-masuk`
> - `src/app/StockAdjustment` -> `src/app/stock-adjustment`

> [!NOTE]
> **Integrasi Tailwind CSS v4 @theme**
> Karena proyek ini menggunakan Tailwind CSS v4, kita akan mendaftarkan CSS variables `:root` dari `globals.css` ke dalam directive `@theme` Tailwind. Dengan cara ini, Junior AI dapat menggunakan utility class standard (seperti `bg-bg`, `text-text-muted`, `border-border`, `bg-accent`) daripada menuliskan inline `style={{ background: 'var(--bg)' }}` secara manual di setiap elemen.

---

## Open Questions

> [!NOTE]
> Tidak ada pertanyaan terbuka saat ini. Rencana di bawah ini telah sepenuhnya mencakup semua halaman yang memerlukan penyelarasan desain dengan basis desain yang sudah terpasang di `kasir/page.tsx` dan `sidebar.tsx`.

---

## Proposed Changes

### Styling & Configuration
#### [MODIFY] [globals.css](file:///d:/ngoding\project\mobile\warungcuan/src/app/globals.css)
- Daftarkan CSS variables dari `:root` ke dalam `@theme` directive Tailwind CSS v4 agar dapat digunakan sebagai utility class standar di seluruh aplikasi.

---

### Folder Restructuring & Navigation (Casing Fix)
#### [NEW] [barang-masuk/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/barang-masuk/page.tsx)
#### [NEW] [barang-masuk/riwayat/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/barang-masuk/riwayat/page.tsx)
#### [NEW] [stock-adjustment/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/stock-adjustment/page.tsx)
#### [DELETE] [BarangMasuk/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/BarangMasuk/page.tsx)
#### [DELETE] [BarangMasuk/riwayat/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/BarangMasuk/riwayat/page.tsx)
#### [DELETE] [StockAdjustment/page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/StockAdjustment/page.tsx)
- Ganti folder dengan format kebab-case untuk menyesuaikan dengan rute sidebar dan standard penamaan URL web yang aman.

---

### UI Standardisation on Pages
#### [MODIFY] [page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/page.tsx) (Manajemen Produk)
- Ganti layout mobile `max-w-md` menjadi responsif yang memanfaatkan ruang dengan baik.
- Terapkan style card standar `bg-card border-border rounded-[10px]` untuk formulir tambah produk dan daftar produk.
- Sesuaikan warna tombol tambah produk menjadi `bg-accent text-accent-text`.

#### [MODIFY] [page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/bon/page.tsx) (Daftar Bon)
- Perbaiki bug nested border (di mana elemen `li` dan `Link` keduanya memiliki border rounded) dengan menghapus border pada `li`.
- Terapkan styling input cari dengan style standard.
- Terapkan styling list link agar memiliki hover state `hover:border-accent/40`.

#### [MODIFY] [page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/bon/[id]/page.tsx) (Detail Bon Pelanggan)
- Ubah button "Bayar Hutang" dan formulir input nominal pembayaran agar menggunakan token warna `bg-accent text-accent-text` dan `border-border`.
- Rapikan list riwayat bon agar memiliki gap yang baik dan outline yang bersih.

#### [MODIFY] [page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/pengeluaran/page.tsx) (Pengeluaran Manual)
- Ubah form input nominal dan catatan agar selaras dengan desain input global.
- Standardisasi tombol pengeluaran dan daftar riwayat pengeluaran.

#### [MODIFY] [page.tsx](file:///d:/ngoding\project\mobile\warungcuan/src/app/dashboard/page.tsx) (Dashboard)
- Desain ulang ringkasan 4 parameter teratas menggunakan grid card yang modern.
- Bungkus "Kekayaan Warung" dengan card premium dengan border aksen tebal `border-accent`.

---

## Verification Plan

### Manual Verification
1. Jalankan aplikasi web lokal menggunakan `npm run dev`.
2. Buka sidebar dan navigasikan ke seluruh halaman (`/`, `/kasir`, `/bon`, `/barang-masuk`, `/stock-adjustment`, `/pengeluaran`, `/dashboard`).
3. Pastikan tidak ada halaman yang menghasilkan error 404 akibat perubahan casing folder.
4. Verifikasi bahwa semua form input, tombol, card, dan warna teks di seluruh halaman telah mengikuti warna tema (`#1E2D3D` untuk text/sidebar, `#2ECC9A` untuk aksen mint, `#F0F4F8` untuk bg, dan `#FFFFFF` untuk card).

---
---

# ISI GIT ISSUE #1 (SIAP DISALIN)

Berikut adalah markdown body lengkap untuk **Git Issue #1: Design** yang dapat langsung disalin ke repositori proyek Anda.

```markdown
# Issue #1: Standardisasi Desain & Konsistensi UI/UX WarungCuan

## Deskripsi
Saat ini, proyek memiliki halaman **Kasir** (`src/app/kasir/page.tsx`) dan **Sidebar** (`src/app/components/sidebar.tsx`) yang sudah menggunakan sistem desain berbasis CSS Variables yang modern, bersih, dan konsisten (menggunakan warna latar belakang `#F0F4F8`, aksen mint green `#2ECC9A`, teks/sidebar gelap `#1E2D3D`, dll.).

Namun, halaman-halaman lainnya (seperti Manajemen Produk, Daftar & Detail Bon, Barang Masuk, Stock Adjustment, Pengeluaran, dan Dashboard) masih menggunakan styling Tailwind dasar yang kasar, tidak konsisten (misal: warna hijau tombol yang berbeda `bg-green-700`, warna link biru `text-blue-600`), serta ukuran layout yang sempit (`max-w-md`).

Issue ini ditujukan untuk **menstandardisasi dan merombak tampilan seluruh halaman** agar mengikuti tema visual dari halaman Kasir dan Sidebar secara konsisten.

---

## Spesifikasi Desain & Token Warna
Gunakan variabel CSS berikut yang sudah didefinisikan di `globals.css` untuk semua komponen UI:
*   **Latar Belakang Utama (`--bg`)**: `#F0F4F8` (Light Grey-Blue)
*   **Kontainer / Card (`--card`)**: `#FFFFFF` (Putih Bersih)
*   **Border (`--border`)**: `#D8E4EC` (Light Ice Blue)
*   **Teks Utama (`--text`)**: `#1E2D3D` (Dark Navy Blue/Slate)
*   **Teks Muted (`--text-muted`)**: `#607080` (Muted Grey-Blue)
*   **Aksen Utama (`--accent`)**: `#2ECC9A` (Vibrant Minty Green)
*   **Teks Aksen (`--accent-text`)**: `#1E2D3D` (Kontras gelap di atas warna mint)
*   **Bahaya/Error (`--danger`)**: `#E05252` (Red Coral)
*   **Bahaya Light (`--danger-light`)**: `#FEF0F0` (Soft Red)

---

## Langkah-Langkah Pengerjaan

### Langkah 1: Registrasi Token di Tailwind CSS v4
Tambahkan directive `@theme` pada file `src/app/globals.css` agar token warna di atas dapat diakses langsung menggunakan utilitas Tailwind standar:
```css
@theme {
  --color-sidebar: var(--sidebar);
  --color-sidebar-text: var(--sidebar-text);
  --color-sidebar-active: var(--sidebar-active);
  --color-sidebar-muted: var(--sidebar-muted);
  --color-accent: var(--accent);
  --color-accent-text: var(--accent-text);
  --color-bg: var(--bg);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);
  --color-danger: var(--danger);
  --color-danger-light: var(--danger-light);
}
```

### Langkah 2: Perbaikan Folder Routing (Casing Bug)
Ubah nama folder di bawah `src/app` agar bertipe kebab-case untuk menyelaraskan dengan tautan di `sidebar.tsx`:
1.  `src/app/BarangMasuk` -> rename menjadi `src/app/barang-masuk`
2.  `src/app/StockAdjustment` -> rename menjadi `src/app/stock-adjustment`
3.  Pastikan semua internal link dan import disesuaikan (misal: navigasi riwayat di dalam barang-masuk).

### Langkah 3: Penyelarasan Layout Halaman Utama (Main Wrapper)
Pada setiap halaman (`src/app/page.tsx`, `src/app/bon/page.tsx`, `src/app/barang-masuk/page.tsx`, dll.):
*   Gunakan pembungkus halaman standar `<main className="p-6 md:p-8 min-h-screen">` tanpa pembatas `max-w-md mx-auto` yang terlalu sempit, agar dashboard terasa luas di desktop namun tetap rapi di mobile.
*   Header judul halaman harus seragam:
    ```tsx
    <h1 className="text-xl font-bold text-text mb-4">Nama Halaman</h1>
    ```

### Langkah 4: Standardisasi Elemen UI

#### A. Form Input & Dropdown Select
Terapkan gaya input modern berikut di semua form:
```tsx
className="w-full bg-card border border-border text-text rounded-[8px] px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/60"
```

#### B. Tombol Aksi (Buttons)
*   **Tombol Utama (Primary)**:
    ```tsx
    className="w-full bg-accent text-accent-text hover:bg-accent/90 disabled:bg-border disabled:text-text-muted font-bold rounded-[8px] py-2.5 text-sm transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
    ```
*   **Tombol Batal/Secondary**:
    ```tsx
    className="w-full bg-transparent border border-border text-text hover:bg-bg/50 font-medium rounded-[8px] py-2.5 text-sm transition-all cursor-pointer"
    ```
*   **Tombol Hapus/Bahaya**:
    ```tsx
    className="text-danger hover:text-danger/80 text-sm font-medium transition-all cursor-pointer"
    ```

#### C. Card Kontainer & List Item
*   Gunakan card dengan background putih, border tipis, sudut membulat 10px, dan bayangan sangat tipis:
    ```tsx
    className="bg-card border border-border rounded-[10px] p-4 shadow-sm transition-all hover:border-accent/30"
    ```
*   Hapus bug nested border pada halaman `/bon` (jangan menumpuk `border` di tag `li` dan `Link` sekaligus). Cukup gunakan `Link` sebagai card langsung di dalam `li` polos.

### Langkah 5: Desain Ulang Halaman Spesifik

1.  **Dashboard (`src/app/dashboard/page.tsx`)**:
    *   Ubah grid summary menjadi 4 kolom responsive pada layar lebar.
    *   Tampilkan "Omset Hari Ini" dengan teks warna `text-accent` dan "Pengeluaran" dengan `text-danger`.
    *   Ubah card "Kekayaan Warung" menjadi card sorotan utama dengan border mint green yang lebih tebal (`border-2 border-accent bg-card rounded-[12px] p-6 shadow-md`).
2.  **Stock Adjustment (`src/app/stock-adjustment/page.tsx`)**:
    *   Perbaiki penyesuaian tombol "Tambah Stok" dan "Kurangi Stok" agar memiliki feedback warna yang jelas:
        *   Tambah Aktif: `bg-accent text-accent-text`
        *   Kurangi Aktif: `bg-danger text-white`
        *   Tidak Aktif: `bg-card border border-border text-text-muted hover:bg-bg/40`

---
## Kriteria Penerimaan (Acceptance Criteria)
*   [ ] Semua halaman (`/`, `/kasir`, `/bon`, `/barang-masuk`, `/stock-adjustment`, `/pengeluaran`, `/dashboard`) dapat diakses tanpa error 404.
*   [ ] Tidak ada warna default Tailwind yang tertinggal (seperti `bg-green-700` atau `text-blue-600`). Semuanya harus terpetakan ke token warna custom (`accent`, `danger`, `text`, dll.).
*   [ ] Layout halaman konsisten menggunakan layout flex sidebar + main content.
*   [ ] Input dan tombol memiliki style yang seragam di seluruh halaman.
*   [ ] Aplikasi lolos build (`npm run build`) tanpa error typescript atau linting.
```

---

## Cara Membuat Git Issue Lewat CLI
Gunakan command berikut untuk membuat issue ini secara otomatis di GitHub menggunakan GitHub CLI (`gh`):
```bash
gh issue create --title "Standardisasi Desain & Konsistensi UI/UX WarungCuan" --body-file implementation_plan.md
```
*(Catatan: Anda juga bisa menyalin teks di atas secara manual ke web interface GitHub/GitLab).*
