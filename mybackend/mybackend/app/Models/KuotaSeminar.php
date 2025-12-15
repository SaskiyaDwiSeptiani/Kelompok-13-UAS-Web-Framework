<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KuotaSeminar extends Model
{
    use HasFactory;

    protected $table = 'kuota_seminar';

    protected $fillable = [
        'jenis_seminar',
        'tanggal',
        'kuota_total',
        'kuota_terpakai',
        'kuota_tersisa',
        'aktif'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'aktif' => 'boolean'
    ];

    // Get semua kuota
    public static function getAllKuota()
    {
        return self::all()->mapWithKeys(function ($kuota) {
            return [$kuota->jenis_seminar => [
                'total' => $kuota->kuota_total,
                'terpakai' => $kuota->kuota_terpakai,
                'tersisa' => $kuota->kuota_tersisa,
                'aktif' => $kuota->aktif
            ]];
        })->toArray();
    }

    // Update kuota setelah pendaftaran
    public function updateAfterRegistration($jenis_seminar)
    {
        $kuota = self::where('jenis_seminar', $jenis_seminar)->first();

        if ($kuota && $kuota->kuota_tersisa > 0) {
            $kuota->kuota_terpakai += 1;
            $kuota->kuota_tersisa = $kuota->kuota_total - $kuota->kuota_terpakai;
            $kuota->save();
            return true;
        }

        return false;
    }

    // Reset kuota (untuk admin)
    public function resetKuota($jenis_seminar)
    {
        $kuota = self::where('jenis_seminar', $jenis_seminar)->first();

        if ($kuota) {
            $kuota->kuota_terpakai = 0;
            $kuota->kuota_tersisa = $kuota->kuota_total;
            $kuota->save();
            return true;
        }

        return false;
    }
}
