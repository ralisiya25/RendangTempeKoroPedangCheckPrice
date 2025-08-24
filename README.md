# RendangKoroSmart – Scan Label Indikator (HTML/CSS/JS)

Project sederhana untuk mendeteksi warna label indikator TTI melalui kamera, lalu menampilkan **status kualitas** dan **harga otomatis**.

## Fitur
- Akses kamera (depan/belakang – tombol *Ganti Kamera*).
- Area panduan (guide box) agar kamu mengarahkan label ke area analisis.
- Ambil snapshot dan hitung rata-rata warna pada area yang dipotong (crop) di tengah bawah frame.
- Klasifikasi warna berdasarkan **threshold RGB**:
  - **Merah Kecoklatan** (berdasarkan data kamu dari Excel Sheet2).
  - **Merah Kekuningan** (sementara/placeholder).
  - **Kuning Terang** (sementara/placeholder).
- Harga otomatis yang bisa diubah dari panel *Pengaturan* (tersimpan di `localStorage`).

## Cara Pakai
1. Ekstrak ZIP ini ke folder lokal.
2. Buka `index.html` di browser (Chrome/Edge/Firefox).
3. Beri izin kamera saat diminta.
4. Arahkan label indikator ke **kotak panduan** → klik **Scan Warna**.
5. Lihat hasil status dan harga otomatis di bagian **Informasi Produk**.

> Catatan: Untuk akurasi, lakukan scan di pencahayaan konsisten. Kamu bisa sesuaikan threshold di `script.js` saat data warna baru tersedia.

## Update Threshold dengan Data Baru
Ubah fungsi berikut di `script.js`:
```js
function isMerahKecoklatan({r,g,b}){
  return (r>=70 && r<=110) && (g>=10 && g<=50) && (b>=10 && b<=40);
}
function isMerahKekuningan({r,g,b}){
  return (r>=120 && r<=200) && (g>=80 && g<=150) && (b>=10 && b<=90) && r>g && b<g;
}
function isKuningTerang({r,g,b}){
  return (r>=200 && g>=200) && (b>=80);
}
```

## Struktur
```
/rendangkoro-scanner
 ├─ index.html
 ├─ style.css
 └─ script.js
```

## Lisensi
MIT
