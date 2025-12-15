<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nama',
        'email',
        'username',
        'password',
        'role',
        'npm',
        'konsentrasi'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relasi untuk mahasiswa (seminar yang diajukan)
    public function seminars()
    {
        return $this->hasMany(Seminar::class, 'mahasiswa_id');
    }

    // Relasi untuk dosen (seminar yang dibimbing)
    public function bimbingan()
    {
        return $this->hasMany(Seminar::class, 'pembimbing_1_id')
            ->orWhere('pembimbing_2_id', $this->id);
    }

    // Relasi untuk review
    public function reviews()
    {
        return $this->hasMany(Review::class, 'dosen_id');
    }

    // Relasi notifikasi
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scope untuk dosen
    public function scopeDosen($query)
    {
        return $query->where('role', 'dosen');
    }

    // Scope untuk mahasiswa
    public function scopeMahasiswa($query)
    {
        return $query->where('role', 'mahasiswa');
    }
}
