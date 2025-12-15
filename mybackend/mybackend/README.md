# Panduan Setup Project Laravel (Beginner Friendly)

Ikuti langkah-langkah berikut untuk menjalankan project Laravel ini dari awal:

## 1. Jalankan Migrasi Database

```bash
php artisan migrate:fresh --seed
```

## 2. Link Storage

Untuk menghubungkan folder storage ke public agar file bisa diakses:

```bash
php artisan storage:link
```

## 3. Jalankan Server Lokal

```bash
php artisan serve
```

Server akan berjalan di `http://localhost:8000`
