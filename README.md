# POS UMKM 🏪

Sistem kasir (Point of Sale) dinamis untuk UMKM — kafe, warung makan, toko snack, dan usaha dagang lain. Dibangun dengan **Next.js 14 (App Router) + Tailwind CSS + Zustand + React Context**, responsive untuk HP, tablet, dan desktop.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

Untuk production:

```bash
npm run build
npm start
```

## Fitur

- **Kasir** — grid produk, pencarian, filter kategori, keranjang pesanan.
- **Varian dinamis** — setiap produk bisa punya banyak grup varian (mis. Soto: Pakai/Tanpa Nasi; Peyek: Jenis × Berat; Kerupuk: Pedas/Original) dengan selisih harga per opsi.
- **Catatan pesanan** — pelanggan bisa minta "tanpa daun bawang, tanpa jeruk nipis", dsb.
- **Pembayaran dummy** — Tunai (hitung kembalian), QRIS (QR simulasi), Kartu Debit, E-Wallet. Alurnya meniru payment gateway sungguhan sehingga mudah diganti integrasi asli (Midtrans/Xendit) nanti.
- **Struk** — preview struk + cetak (format thermal 72mm via print browser).
- **Kelola Produk** — CRUD kategori, produk, grup varian, dan opsi — semuanya dari UI, tanpa ubah kode. Inilah yang membuat sistem bisa dipakai jenis usaha apa pun.
- **Stok** — lacak stok per produk (opsional), berkurang otomatis saat transaksi, peringatan stok menipis.
- **Riwayat** — daftar transaksi + cetak ulang struk.
- **Laporan** — pendapatan, jumlah transaksi, produk terlaris, rekap per metode pembayaran (Hari ini / 7 hari / 30 hari / semua).
- **Pengaturan** — nama usaha, alamat, pajak %, footer struk.

## Penyimpanan Data

Data disimpan di **localStorage** browser (via `zustand/persist`) — cocok untuk 1 perangkat kasir. Untuk multi-perangkat/cloud, lapisan store di folder `store/` mudah dipindahkan ke database (mis. Supabase) tanpa mengubah UI.

## Struktur

```
app/            halaman (kasir, produk, riwayat, laporan, pengaturan)
components/     UI (kartu produk, modal varian, panel order, pembayaran, struk)
store/          Zustand stores (produk, keranjang, transaksi, pengaturan)
context/        UIContext (toast & hidrasi)
lib/            util format & data seed
```

## Mengganti Payment Gateway Dummy

Logika dummy ada di `components/PaymentModal.js` fungsi `startProcessing()` — ganti `setTimeout` dengan panggilan API gateway pilihanmu (Midtrans Snap, Xendit, dll), lalu panggil `onConfirm()` saat callback sukses.
