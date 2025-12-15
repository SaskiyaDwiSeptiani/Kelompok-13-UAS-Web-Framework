<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seminar extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'pembimbing_1_id',
        'pembimbing_2_id',
        'penguji_1_id',
        'penguji_2_id',
        'judul_seminar',
        'jenis_seminar',
        'abstrak',
        'file_proposal',
        'tanggal_seminar',
        'jam_mulai',
        'jam_selesai',
        'ruang_seminar',
        'status',
        'catatan',
        'nilai',
        'nilai_angka',
        'tanggal_daftar',
        'tanggal_review',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal_seminar' => 'date',
        'jam_mulai' => 'string',
        'jam_selesai' => 'string',
        'tanggal_daftar' => 'datetime',
        'tanggal_review' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'nilai_angka' => 'decimal:2',
    ];

    protected $appends = [
        'jenis_seminar_text',
        'status_text',
        'status_badge',
        'jam_mulai_formatted',
        'jam_selesai_formatted',
        'durasi_seminar',
        'jadwal_lengkap'
    ];

    // Relasi ke mahasiswa
    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }

    // Relasi ke pembimbing 1
    public function pembimbing1()
    {
        return $this->belongsTo(User::class, 'pembimbing_1_id');
    }

    // Relasi ke pembimbing 2
    public function pembimbing2()
    {
        return $this->belongsTo(User::class, 'pembimbing_2_id');
    }

    // Relasi ke penguji 1
    public function penguji1()
    {
        return $this->belongsTo(User::class, 'penguji_1_id');
    }

    // Relasi ke penguji 2
    public function penguji2()
    {
        return $this->belongsTo(User::class, 'penguji_2_id');
    }

    // Relasi ke reviews
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Relasi ke kuota seminar
    public function kuotaSeminar()
    {
        return $this->belongsTo(KuotaSeminar::class, 'jenis_seminar', 'jenis_seminar');
    }

    // Helper untuk jenis seminar text
    public function getJenisSeminarTextAttribute()
    {
        $jenis = [
            'seminar_proposal' => 'Seminar Proposal',
            'seminar_hasil' => 'Seminar Hasil',
            'seminar_kp' => 'Seminar Kerja Praktek',
            'seminar_umum' => 'Seminar Umum',
            'sidang_skripsi' => 'Sidang Skripsi',
        ];

        return $jenis[$this->jenis_seminar] ?? $this->jenis_seminar;
    }

    // Helper untuk status text
    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'Menunggu Review',
            'disetujui' => 'Disetujui',
            'ditolak' => 'Ditolak',
            'selesai' => 'Selesai'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    // Helper untuk status badge
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'warning',
            'disetujui' => 'success',
            'ditolak' => 'danger',
            'selesai' => 'info'
        ];

        return $badges[$this->status] ?? 'secondary';
    }

    // Format jam
    public function getJamMulaiFormattedAttribute()
    {
        if (!$this->jam_mulai) return '-';
        
        try {
            $time = \Carbon\Carbon::createFromFormat('H:i:s', $this->jam_mulai);
            return $time->format('H:i');
        } catch (\Exception $e) {
            return $this->jam_mulai;
        }
    }

    public function getJamSelesaiFormattedAttribute()
    {
        if (!$this->jam_selesai) return '-';
        
        try {
            $time = \Carbon\Carbon::createFromFormat('H:i:s', $this->jam_selesai);
            return $time->format('H:i');
        } catch (\Exception $e) {
            return $this->jam_selesai;
        }
    }

    // Hitung durasi seminar
    public function getDurasiSeminarAttribute()
    {
        if ($this->jam_mulai && $this->jam_selesai) {
            try {
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $this->jam_mulai);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $this->jam_selesai);
                return $end->diffInMinutes($start);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    // Jadwal lengkap
    public function getJadwalLengkapAttribute()
    {
        if ($this->tanggal_seminar) {
            $tanggal = $this->tanggal_seminar->format('d F Y');
            $ruang = $this->ruang_seminar;
            
            if ($this->jam_mulai) {
                $jam = $this->jam_mulai_formatted;
                return "{$tanggal}, {$jam}" . ($ruang ? " - {$ruang}" : "");
            }
            
            return $tanggal . ($ruang ? " - {$ruang}" : "");
        }
        return 'Belum dijadwalkan';
    }

    // Cek kuota tersedia
    public static function cekKuotaTersedia($jenis_seminar)
    {
        $kuota = \App\Models\KuotaSeminar::where('jenis_seminar', $jenis_seminar)->first();
        return $kuota ? $kuota->kuota_tersisa > 0 : false;
    }

    // Update kuota setelah pendaftaran
    public function updateKuota()
    {
        $kuota = \App\Models\KuotaSeminar::where('jenis_seminar', $this->jenis_seminar)->first();
        
        if ($kuota) {
            if ($this->status === 'disetujui' || $this->status === 'pending') {
                $kuota->kuota_terpakai += 1;
                $kuota->kuota_tersisa = $kuota->kuota_total - $kuota->kuota_terpakai;
                $kuota->save();
            }
        }
    }

    // Scope untuk dashboard
    public function scopeByMahasiswa($query, $mahasiswaId)
    {
        return $query->where('mahasiswa_id', $mahasiswaId);
    }

    public function scopeByPembimbing($query, $dosenId)
    {
        return $query->where(function ($q) use ($dosenId) {
            $q->where('pembimbing_1_id', $dosenId)
              ->orWhere('pembimbing_2_id', $dosenId);
        });
    }

    public function scopeByPenguji($query, $dosenId)
    {
        return $query->where(function ($q) use ($dosenId) {
            $q->where('penguji_1_id', $dosenId)
              ->orWhere('penguji_2_id', $dosenId);
        });
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDisetujui($query)
    {
        return $query->where('status', 'disetujui');
    }

    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }
}