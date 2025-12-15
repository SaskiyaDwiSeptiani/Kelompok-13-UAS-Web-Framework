<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DosenSeeder extends Seeder
{
  public function run()
  {
    $mockDosen = [
      ['nama' => 'Dr. Ahmad Santoso, M.Kom.', 'bidang' => 'Artificial Intelligence'],
      ['nama' => 'Prof. Dr. Siti Rahayu, M.Sc.', 'bidang' => 'Data Science'],
      ['nama' => 'Dr. Budi Prasetyo, M.T.', 'bidang' => 'Software Engineering'],
      ['nama' => 'Drs. Muhammad Rizki, M.Kom.', 'bidang' => 'Computer Network'],
      ['nama' => 'Dr. Linda Wijaya, M.Sc.', 'bidang' => 'Human Computer Interaction'],
      ['nama' => 'Diana Sari, M.T.', 'bidang' => 'Web Development'],
    ];

    foreach ($mockDosen as $index => $dosen) {
      // generate email & username otomatis
      $username = Str::slug(explode(',', $dosen['nama'])[0], '.'); // contoh: dr.ahmad-santoso -> dr.ahmad.santoso
      $email = $username . '@univ.ac.id';

      DB::table('users')->insert([
        'nama' => $dosen['nama'],
        'email' => $email,
        'username' => $username,
        'password' => Hash::make('password'), // ganti sesuai kebutuhan
        'role' => 'dosen',
        'konsentrasi' => $dosen['bidang'],
        'npm' => null,
        'created_at' => now(),
        'updated_at' => now(),
      ]);
    }
  }
}
