<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'seminar_id',
        'dosen_id',
        'peran',
        'status',
        'catatan',
        'file_review',
        'nilai_komponen_1',
        'nilai_komponen_2',
        'nilai_komponen_3',
        'nilai_komponen_4',
        'nilai_komponen_5',
        'nilai_akhir',
        'tanggal_review',
        'deadline_review',
        'tanggal_alternatif',
        'jam_alternatif',
        'ruang_alternatif',
    ];

    protected $casts = [
        'tanggal_review' => 'datetime',
        'deadline_review' => 'datetime',
        'nilai_akhir' => 'decimal:2',
        'tanggal_alternatif' => 'date',
        'jam_alternatif' => 'string',
    ];

    /**
     * Relasi ke Seminar
     */
    public function seminar()
    {
        return $this->belongsTo(Seminar::class);
    }

    /**
     * Relasi ke Dosen Reviewer
     */
    public function dosen()
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    /**
     * Format peran → lebih mudah dibaca
     */
    public function getPeranTextAttribute()
    {
        $roles = [
            'pembimbing_1' => 'Pembimbing 1',
            'pembimbing_2' => 'Pembimbing 2',
            'penguji_1' => 'Penguji 1',
            'penguji_2' => 'Penguji 2',
        ];

        return $roles[$this->peran] ?? $this->peran;
    }

    /**
     * Format badge status
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'menunggu' => 'warning',
            'direview' => 'primary',
            'disetujui' => 'success',
            'ditolak' => 'danger',
            'revisi' => 'info',
        ];

        return $badges[$this->status] ?? 'secondary';
    }
}
