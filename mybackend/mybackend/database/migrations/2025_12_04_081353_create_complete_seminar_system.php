<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Table users sudah ada, kita update
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'konsentrasi')) {
                    $table->string('konsentrasi')->nullable()->after('role');
                }
                if (!Schema::hasColumn('users', 'npm')) {
                    $table->string('npm')->nullable()->unique()->after('email');
                }
            });
        }

        // Table seminars - Diperbarui sesuai kebutuhan sistem lengkap
        if (!Schema::hasTable('seminars')) {
            Schema::create('seminars', function (Blueprint $table) {
                $table->id();
                $table->foreignId('mahasiswa_id')->constrained('users')->onDelete('cascade');

                // Dosen pembimbing
                $table->foreignId('pembimbing_1_id')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('pembimbing_2_id')->nullable()->constrained('users')->onDelete('set null');

                // Dosen penguji
                $table->foreignId('penguji_1_id')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('penguji_2_id')->nullable()->constrained('users')->onDelete('set null');

                // Info seminar
                $table->string('judul_seminar');
                $table->enum('jenis_seminar', [
                    'seminar_proposal',
                    'seminar_hasil',
                    'seminar_kp',
                    'seminar_umum',
                    'sidang_skripsi'
                ]);
                $table->text('abstrak')->nullable();
                $table->string('file_proposal')->nullable();

                // Jadwal seminar
                $table->date('tanggal_seminar')->nullable();
                $table->time('jam_mulai')->nullable();
                $table->time('jam_selesai')->nullable();
                $table->string('ruang_seminar')->nullable();

                // Status dan nilai
                $table->enum('status', ['pending', 'disetujui', 'ditolak', 'selesai'])->default('pending');
                $table->text('catatan')->nullable();
                $table->string('nilai')->nullable();
                $table->decimal('nilai_angka', 5, 2)->nullable();

                // Timestamps
                $table->timestamp('tanggal_daftar')->useCurrent();
                $table->timestamp('tanggal_review')->nullable();
                $table->timestamp('tanggal_selesai')->nullable();
                $table->timestamps();

                // Index untuk performa
                $table->index(['jenis_seminar', 'status']);
                $table->index('mahasiswa_id');
                $table->index('pembimbing_1_id');
                $table->index('pembimbing_2_id');
                $table->index('penguji_1_id');
                $table->index('penguji_2_id');
            });
        } else {
            // Jika tabel sudah ada, update strukturnya
            Schema::table('seminars', function (Blueprint $table) {
                // Tambahkan kolom jika belum ada
                if (!Schema::hasColumn('seminars', 'pembimbing_1_id')) {
                    $table->foreignId('pembimbing_1_id')->nullable()->constrained('users')->onDelete('set null')->after('mahasiswa_id');
                }
                if (!Schema::hasColumn('seminars', 'pembimbing_2_id')) {
                    $table->foreignId('pembimbing_2_id')->nullable()->constrained('users')->onDelete('set null')->after('pembimbing_1_id');
                }
                if (!Schema::hasColumn('seminars', 'penguji_1_id')) {
                    $table->foreignId('penguji_1_id')->nullable()->constrained('users')->onDelete('set null')->after('pembimbing_2_id');
                }
                if (!Schema::hasColumn('seminars', 'penguji_2_id')) {
                    $table->foreignId('penguji_2_id')->nullable()->constrained('users')->onDelete('set null')->after('penguji_1_id');
                }
                if (!Schema::hasColumn('seminars', 'jam_mulai')) {
                    $table->time('jam_mulai')->nullable()->after('tanggal_seminar');
                }
                if (!Schema::hasColumn('seminars', 'jam_selesai')) {
                    $table->time('jam_selesai')->nullable()->after('jam_mulai');
                }
                if (!Schema::hasColumn('seminars', 'ruang_seminar')) {
                    $table->string('ruang_seminar')->nullable()->after('jam_selesai');
                }
                if (!Schema::hasColumn('seminars', 'nilai_angka')) {
                    $table->decimal('nilai_angka', 5, 2)->nullable()->after('nilai');
                }
                if (!Schema::hasColumn('seminars', 'tanggal_selesai')) {
                    $table->timestamp('tanggal_selesai')->nullable()->after('tanggal_review');
                }

                // Update enum status jika perlu
                $table->enum('status', ['pending', 'disetujui', 'ditolak', 'selesai'])->default('pending')->change();
            });
        }

        // Table kuota seminar
        if (!Schema::hasTable('kuota_seminar')) {
            Schema::create('kuota_seminar', function (Blueprint $table) {
                $table->id();
                $table->enum('jenis_seminar', [
                    'seminar_proposal',
                    'seminar_hasil',
                    'seminar_kp',
                    'seminar_umum',
                    'sidang_skripsi'
                ]);
                $table->date('tanggal')->nullable();
                $table->integer('kuota_total')->default(50); // Kuota per jenis seminar
                $table->integer('kuota_terpakai')->default(0);
                $table->integer('kuota_tersisa')->default(50);
                $table->boolean('aktif')->default(true);
                $table->timestamps();

                $table->unique(['jenis_seminar', 'tanggal']);
            });

            // Insert default kuota
            DB::table('kuota_seminar')->insert([
                ['jenis_seminar' => 'seminar_proposal', 'kuota_total' => 50, 'kuota_tersisa' => 50, 'created_at' => now(), 'updated_at' => now()],
                ['jenis_seminar' => 'seminar_hasil', 'kuota_total' => 50, 'kuota_tersisa' => 50, 'created_at' => now(), 'updated_at' => now()],
                ['jenis_seminar' => 'seminar_kp', 'kuota_total' => 50, 'kuota_tersisa' => 50, 'created_at' => now(), 'updated_at' => now()],
                ['jenis_seminar' => 'seminar_umum', 'kuota_total' => 50, 'kuota_tersisa' => 50, 'created_at' => now(), 'updated_at' => now()],
                ['jenis_seminar' => 'sidang_skripsi', 'kuota_total' => 50, 'kuota_tersisa' => 50, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Table reviews
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seminar_id')->constrained('seminars')->onDelete('cascade');
                $table->foreignId('dosen_id')->constrained('users')->onDelete('cascade');
                $table->enum('peran', ['pembimbing_1', 'pembimbing_2', 'penguji_1', 'penguji_2']);

                // Status review
                $table->enum('status', ['menunggu', 'direview', 'disetujui', 'ditolak', 'revisi'])->default('menunggu');
                $table->text('catatan')->nullable();
                $table->string('file_review')->nullable();

                // Komponen penilaian
                $table->integer('nilai_komponen_1')->nullable();
                $table->integer('nilai_komponen_2')->nullable();
                $table->integer('nilai_komponen_3')->nullable();
                $table->integer('nilai_komponen_4')->nullable();
                $table->integer('nilai_komponen_5')->nullable();
                $table->decimal('nilai_akhir', 5, 2)->nullable();

                $table->date('tanggal_alternatif')->nullable();
                $table->time('jam_alternatif')->nullable();
                $table->string('ruang_alternatif')->nullable();

                $table->timestamp('tanggal_review')->nullable();
                $table->timestamp('deadline_review')->nullable();
                $table->timestamps();

                $table->unique(['seminar_id', 'dosen_id', 'peran']);
                $table->index('status');
            });
        }

        // Table notifikasi
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('seminar_id')->nullable()->constrained('seminars')->onDelete('cascade');
                $table->string('judul');
                $table->text('pesan');
                $table->enum('tipe', ['info', 'success', 'warning', 'error'])->default('info');
                $table->enum('kategori', ['pendaftaran', 'review', 'jadwal', 'nilai', 'umum'])->default('umum');
                $table->boolean('dibaca')->default(false);
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'dibaca']);
                $table->index('seminar_id');
            });
        }

        // Table histori seminar
        if (!Schema::hasTable('seminar_histories')) {
            Schema::create('seminar_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seminar_id')->constrained('seminars')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->enum('status_sebelum', ['pending', 'disetujui', 'ditolak', 'selesai'])->nullable();
                $table->enum('status_sesudah', ['pending', 'disetujui', 'ditolak', 'selesai']);
                $table->text('keterangan')->nullable();
                $table->timestamps();

                $table->index('seminar_id');
                $table->index('user_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('seminar_histories');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('kuota_seminar');
        Schema::dropIfExists('seminars');
    }
};
