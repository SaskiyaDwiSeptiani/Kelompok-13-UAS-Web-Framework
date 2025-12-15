<?php

namespace App\Http\Controllers;

use App\Models\Seminar;
use App\Models\KuotaSeminar;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SeminarController extends Controller
{
    // Daftar seminar baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis_seminar' => 'required|in:seminar_proposal,seminar_hasil,seminar_kp,seminar_umum,sidang_skripsi',
            'judul_seminar' => 'required|string|max:255',
            'abstrak' => 'required|string',
            'file_proposal' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB
            'pembimbing_1_id' => 'required|exists:users,id',
            'pembimbing_2_id' => 'nullable|exists:users,id',
            'penguji_1_id' => 'nullable|exists:users,id',
            'penguji_2_id' => 'nullable|exists:users,id',
            'tanggal_seminar' => 'required|date|after_or_equal:today',
            'jam_mulai' => 'required|date_format:H:i',
            'ruang_seminar' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek kuota
        $kuota = KuotaSeminar::where('jenis_seminar', $request->jenis_seminar)->first();

        if (!$kuota || $kuota->kuota_tersisa <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota untuk jenis seminar ini sudah penuh'
            ], 400);
        }

        // Upload file proposal
        if ($request->hasFile('file_proposal')) {
            $file = $request->file('file_proposal');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('proposals', $filename, 'public');
        }

        // Hitung jam selesai berdasarkan durasi default
        $jamMulai = \Carbon\Carbon::createFromFormat('H:i', $request->jam_mulai);

        // Durasi berdasarkan jenis seminar
        $durasi = [
            'seminar_proposal' => 2,
            'seminar_hasil' => 2,
            'seminar_kp' => 1.5,
            'seminar_umum' => 1,
            'sidang_skripsi' => 3
        ];

        $jamSelesai = $jamMulai->copy()->addHours($durasi[$request->jenis_seminar] ?? 2);

        // Buat seminar
        $seminar = Seminar::create([
            'mahasiswa_id' => Auth::id(),
            'pembimbing_1_id' => $request->pembimbing_1_id,
            'pembimbing_2_id' => $request->pembimbing_2_id,
            'penguji_1_id' => $request->penguji_1_id,
            'penguji_2_id' => $request->penguji_2_id,
            'judul_seminar' => $request->judul_seminar,
            'jenis_seminar' => $request->jenis_seminar,
            'abstrak' => $request->abstrak,
            'file_proposal' => $filename ?? null,
            'tanggal_seminar' => $request->tanggal_seminar,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $jamSelesai->format('H:i'),
            'ruang_seminar' => $request->ruang_seminar,
            'status' => 'pending',
            'tanggal_daftar' => now(),
        ]);

        // Update kuota
        if ($seminar) {
            $kuota->kuota_terpakai += 1;
            $kuota->kuota_tersisa = $kuota->kuota_total - $kuota->kuota_terpakai;
            $kuota->save();

            // Buat notifikasi untuk dosen
            $this->createNotificationsForDosen($seminar);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran seminar berhasil dikirim',
                'data' => $seminar
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mendaftarkan seminar'
        ], 500);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_seminar' => 'required|date|after_or_equal:today',
            'jam_mulai' => 'required|date_format:H:i',
            'ruang_seminar' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Hitung jam selesai berdasarkan durasi default
        $jamMulai = \Carbon\Carbon::createFromFormat('H:i', $request->jam_mulai);

        // Durasi berdasarkan jenis seminar
        $durasi = [
            'seminar_proposal' => 2,
            'seminar_hasil' => 2,
            'seminar_kp' => 1.5,
            'seminar_umum' => 1,
            'sidang_skripsi' => 3
        ];

        $jamSelesai = $jamMulai->copy()->addHours($durasi[$request->jenis_seminar] ?? 2);

        // Update seminar
        $seminar = Seminar::findOrFail($id)->update([
            'tanggal_seminar' => $request->tanggal_seminar,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $jamSelesai->format('H:i'),
            'ruang_seminar' => $request->ruang_seminar,
            'status' => 'pending',
        ]);

        if ($seminar) {
            return response()->json([
                'success' => true,
                'message' => 'Jadwal seminar berhasil diperbarui',
                'data' => $seminar
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui jadwal seminar'
        ], 500);
    }

    // Buat notifikasi untuk dosen
    private function createNotificationsForDosen($seminar)
    {
        $dosenIds = [
            $seminar->pembimbing_1_id,
            $seminar->pembimbing_2_id,
            $seminar->penguji_1_id,
            $seminar->penguji_2_id
        ];

        $mahasiswa = Auth::user();

        foreach ($dosenIds as $index => $dosenId) {
            if ($dosenId) {
                $peran = ['Pembimbing 1', 'Pembimbing 2', 'Penguji 1', 'Penguji 2'][$index];

                Notification::create([
                    'user_id' => $dosenId,
                    'seminar_id' => $seminar->id,
                    'judul' => 'Permintaan Review Seminar',
                    'pesan' => "Mahasiswa {$mahasiswa->nama} ({$mahasiswa->npm}) mengajukan seminar sebagai {$peran} dengan judul: {$seminar->judul_seminar}",
                    'tipe' => 'info',
                    'kategori' => 'pendaftaran',
                    'metadata' => [
                        'seminar_id' => $seminar->id,
                        'peran' => strtolower(str_replace(' ', '_', $peran))
                    ]
                ]);
            }
        }
    }

    // Get seminar by user
    public function getUserSeminars()
    {
        $user = Auth::user();

        if ($user->role === 'mahasiswa') {
            $seminars = Seminar::where('mahasiswa_id', $user->id)
                ->with(['pembimbing1', 'pembimbing2', 'penguji1', 'penguji2'])
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'dosen') {
            $seminars = Seminar::where(function ($query) use ($user) {
                $query->where('pembimbing_1_id', $user->id)
                    ->orWhere('pembimbing_2_id', $user->id)
                    ->orWhere('penguji_1_id', $user->id)
                    ->orWhere('penguji_2_id', $user->id);
            })
                ->with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'penguji2'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $seminars = Seminar::with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'penguji2'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $seminars
        ]);
    }
}
