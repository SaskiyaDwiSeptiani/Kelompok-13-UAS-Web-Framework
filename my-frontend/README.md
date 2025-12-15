# 📚 Panduan Setup Project React - Sistem Pendaftaran Seminar

Panduan ini akan membantu Anda menjalankan project React dari awal, bahkan jika Anda baru pertama kali menggunakan React atau web development.

---

## 📋 Daftar Isi
1. [Menjalankan Aplikasi](#menjalankan-aplikasi)
2. [Troubleshooting](#troubleshooting)
3. [Penjelasan Fitur Aplikasi](#penjelasan-fitur-aplikasi)

---

## 🎯 Menjalankan Aplikasi

### Langkah 1: Start Development Server
1. Di terminal VS Code, ketik:
   ```bash
   npm start
   ```

2. Tekan **Enter**

3. Tunggu beberapa saat (20-60 detik)
   - Anda akan melihat pesan: `Compiled successfully!`
   - Browser akan otomatis terbuka ke `http://localhost:3000`

✅ **Aplikasi React Anda sekarang berjalan!**

### Langkah 2: Mengakses Aplikasi
- Aplikasi akan otomatis terbuka di browser
- Jika tidak otomatis terbuka, buka browser dan ketik: `http://localhost:3000`

### Langkah 3: Menghentikan Aplikasi
Untuk menghentikan development server:
1. Kembali ke terminal VS Code
2. Tekan `Ctrl + C`
3. Ketik `Y` (yes) jika diminta konfirmasi
4. Tekan Enter

---

## 🔧 Troubleshooting

### Problem: `npm: command not found` atau `node: command not found`
**Solusi:**
1. Pastikan Node.js sudah terinstall dengan benar
2. Restart komputer Anda
3. Buka terminal baru dan coba lagi

---

### Problem: Error saat `npm install`
**Solusi 1: Hapus cache npm**
```bash
npm cache clean --force
npm install
```

**Solusi 2: Hapus node_modules dan install ulang**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Mac/Linux
rm -rf node_modules
rm package-lock.json
npm install
```

---

### Problem: Port 3000 sudah digunakan
**Pesan Error:** `Something is already running on port 3000`

**Solusi:**
- Tekan `Y` untuk menggunakan port lain (biasanya 3001)
- Atau matikan aplikasi yang menggunakan port 3000

---

### Problem: Halaman browser kosong/putih
**Solusi:**
1. Buka browser dan tekan `F12` untuk membuka Developer Tools
2. Lihat tab **Console** untuk melihat error
3. Pastikan tidak ada error merah
4. Coba refresh halaman dengan `Ctrl + F5`

---

### Problem: Error "Module not found"
**Solusi:**
```bash
npm install
```
Pastikan semua dependencies terinstall dengan benar.

---

## 📱 Penjelasan Fitur Aplikasi

Project ini adalah **Sistem Pendaftaran Seminar** dengan fitur:

### 1. **Halaman Login** (`/login`)
- Untuk masuk ke sistem
- Username dan password

### 2. **Halaman Register** (`/register`)
- Untuk mendaftar akun baru
- Pilih role: Mahasiswa, Dosen, atau Admin

### 3. **Dashboard** (`/dashboard`)
- Tampilan berbeda untuk setiap role:
  - **Mahasiswa**: Melihat dan mendaftar seminar
  - **Dosen**: Me-review pendaftaran mahasiswa
  - **Admin**: Mengelola seminar dan pengguna

### 4. **Daftar Seminar** (`/daftar-seminar`)
- Mahasiswa dapat mendaftar ke seminar
- Upload file dokumen pendaftaran

### 5. **Review Pendaftaran** (`/review/:id`)
- Dosen dapat approve/reject pendaftaran
- Memberikan catatan/feedback

---

## 📂 Struktur Folder Project

```
my-frontend/
├── public/              # File statis (HTML, gambar, dll)
├── src/                 # Source code aplikasi
│   ├── components/      # Komponen React yang bisa digunakan ulang
│   ├── api/            # Konfigurasi API dan endpoints
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Fungsi helper
│   ├── validations/    # Schema validasi form
│   ├── App.js          # Komponen utama
│   └── index.js        # Entry point aplikasi
├── package.json        # Daftar dependencies dan scripts
└── README.md          # Dokumentasi ini
```

---

## 🎓 Tips untuk Pemula

### 1. **Hot Reload**
Setiap kali Anda menyimpan perubahan kode (`Ctrl + S`), aplikasi akan otomatis reload di browser. Tidak perlu restart server!

### 2. **Membaca Error**
Jika ada error:
- Lihat terminal untuk error backend/kompilasi
- Buka browser Developer Tools (`F12`) → tab Console untuk error frontend

### 3. **Belajar Bertahap**
Mulai dengan:
1. Pahami struktur folder
2. Lihat `App.js` untuk routing
3. Buka file component satu per satu
4. Eksperimen dengan mengubah text/styling

---

## 📚 Sumber Belajar Tambahan

### Dokumentasi Resmi:
- **React**: https://react.dev/learn
- **React Router**: https://reactrouter.com/
- **React Hook Form**: https://react-hook-form.com/

### Tutorial Bahasa Indonesia:
- Web Programming UNPAS (YouTube)
- Programmer Zaman Now (YouTube)
- BuildWithAngga (Platform Belajar)

---

## 🆘 Butuh Bantuan?

Jika mengalami kendala:
1. Baca bagian [Troubleshooting](#troubleshooting) di atas
2. Cek error message dengan teliti
3. Google error message tersebut
4. Tanya di komunitas:
   - Stack Overflow
   - Facebook Group: React Indonesia
   - Discord: ReactiFlux

---

## 📝 Perintah Penting

| Perintah | Fungsi |
|----------|--------|
| `npm install` | Install semua dependencies |
| `npm start` | Menjalankan aplikasi (development) |
| `npm test` | Menjalankan test |
| `npm run build` | Build aplikasi untuk production |

---

## ✅ Checklist Setup

- [ ] Node.js terinstall (versi 18 atau lebih baru)
- [ ] VS Code terinstall
- [ ] Project sudah di-download/clone
- [ ] `npm install` berhasil dijalankan
- [ ] `npm start` berhasil dan aplikasi terbuka di browser
- [ ] Bisa mengakses halaman login di `http://localhost:3000/login`

---

**Selamat! Anda berhasil setup project React! 🎉**
