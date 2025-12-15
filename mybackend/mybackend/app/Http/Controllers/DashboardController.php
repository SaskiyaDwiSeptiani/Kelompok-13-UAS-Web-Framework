<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Seminar;
use App\Models\Review;
use App\Models\KuotaSeminar;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    // Get dashboard data based on user role
    public function getDashboardData()
    {
        $user = Auth::user();

        if ($user->role === 'mahasiswa') {
            return $this->getMahasiswaDashboard($user);
        } elseif ($user->role === 'dosen') {
            return $this->getDosenDashboard($user);
        } elseif ($user->role === 'admin') {
            return $this->getAdminDashboard($user);
        }

        return response()->json([
            'success' => false,
            'message' => 'Role tidak valid'
        ], 403);
    }

    // Dashboard untuk mahasiswa
    private function getMahasiswaDashboard($user)
    {
        $seminars = Seminar::where('mahasiswa_id', $user->id)
            ->with(['pembimbing1', 'pembimbing2', 'penguji1', 'penguji2', 'reviews.dosen'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Hitung statistik
        $total = $seminars->count();
        $disetujui = $seminars->where('status', 'disetujui')->count();
        $pending = $seminars->where('status', 'pending')->count();
        $ditolak = $seminars->where('status', 'ditolak')->count();

        // Format data untuk response
        $formattedSeminars = $seminars->map(function ($seminar) {
            return [
                'id' => $seminar->id,
                'judul_seminar' => $seminar->judul_seminar,
                'jenis_seminar' => $seminar->jenis_seminar,
                'jenis_seminar_text' => $seminar->jenis_seminar_text,
                'abstrak' => $seminar->abstrak,
                'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),
                'status' => $seminar->status,
                'status_text' => $seminar->status_text,
                'catatan' => $seminar->catatan,
                'nilai' => $seminar->nilai,
                'file_proposal' => $seminar->file_proposal,

                // Jadwal seminar
                'tanggal_seminar' => $seminar->tanggal_seminar ? $seminar->tanggal_seminar->toISOString() : null,
                'jam_mulai' => $seminar->jam_mulai_formatted,
                'jam_selesai' => $seminar->jam_selesai_formatted,
                'ruang_seminar' => $seminar->ruang_seminar,

                // Info dosen
                'pembimbing_1' => $seminar->pembimbing1 ? [
                    'id' => $seminar->pembimbing1->id,
                    'nama' => $seminar->pembimbing1->nama,
                    'konsentrasi' => $seminar->pembimbing1->konsentrasi
                ] : null,
                'pembimbing_2' => $seminar->pembimbing2 ? [
                    'id' => $seminar->pembimbing2->id,
                    'nama' => $seminar->pembimbing2->nama,
                    'konsentrasi' => $seminar->pembimbing2->konsentrasi
                ] : null,
                'penguji_1' => $seminar->penguji1 ? [
                    'id' => $seminar->penguji1->id,
                    'nama' => $seminar->penguji1->nama,
                    'konsentrasi' => $seminar->penguji1->konsentrasi
                ] : null,
                'penguji_2' => $seminar->penguji2 ? [
                    'id' => $seminar->penguji2->id,
                    'nama' => $seminar->penguji2->nama,
                    'konsentrasi' => $seminar->penguji2->konsentrasi
                ] : null,

                // Reviews
                'reviews' => $seminar->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'dosen' => $review->dosen ? $review->dosen->nama : null,
                        'status' => $review->status,
                        'catatan' => $review->catatan,
                        'file_review' => $review->file_review,
                        'tanggal_review' => $review->tanggal_review->toISOString()
                    ];
                })
            ];
        });

        // Ambil info kuota
        $kuotaInfo = KuotaSeminar::getAllKuota();

        return response()->json([
            'success' => true,
            'role' => 'mahasiswa',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'npm' => $user->npm,
                'role' => $user->role,
                'konsentrasi' => $user->konsentrasi
            ],
            'stats' => [
                'total' => $total,
                'disetujui' => $disetujui,
                'pending' => $pending,
                'ditolak' => $ditolak
            ],
            'seminars' => $formattedSeminars,
            'kuota_info' => $kuotaInfo,
            'notifications' => $this->getUserNotifications($user->id)
        ]);
    }

    // Dashboard untuk dosen
    private function getDosenDashboard($user)
    {
        // Seminar yang dibimbing
        $bimbingan = Seminar::where(function ($q) use ($user) {
            $q->where('pembimbing_1_id', $user->id)
                ->orWhere('pembimbing_2_id', $user->id);
        })
            ->with(['mahasiswa', 'penguji1', 'penguji2', 'reviews'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Seminar yang diuji (penguji 1)
        $pengujian1 = Seminar::where('penguji_1_id', $user->id)
            ->with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji2', 'reviews'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Seminar yang diuji (penguji 2)
        $pengujian2 = Seminar::where('penguji_2_id', $user->id)
            ->with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'reviews'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Gabungkan semua seminar yang diuji
        $pengujian = $pengujian1->merge($pengujian2);

        // Seminar yang perlu direview (pending)
        $pendingReview = Seminar::where('status', 'pending')
            ->where(function ($query) use ($user) {
                $query->where('pembimbing_1_id', $user->id)
                    ->orWhere('pembimbing_2_id', $user->id)
                    ->orWhere('penguji_1_id', $user->id)
                    ->orWhere('penguji_2_id', $user->id);
            })
            ->with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'penguji2'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Format data bimbingan
        $formattedBimbingan = $bimbingan->map(function ($seminar) {
            return [
                'id' => $seminar->id,
                'judul_seminar' => $seminar->judul_seminar,
                'jenis_seminar' => $seminar->jenis_seminar_text,
                'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),
                'status' => $seminar->status,
                'status_text' => $seminar->status_text,
                'catatan' => $seminar->catatan,

                // Info mahasiswa
                'mahasiswa' => $seminar->mahasiswa ? [
                    'id' => $seminar->mahasiswa->id,
                    'nama' => $seminar->mahasiswa->nama,
                    'npm' => $seminar->mahasiswa->npm,
                    'konsentrasi' => $seminar->mahasiswa->konsentrasi
                ] : null,

                // Info penguji
                'penguji_1' => $seminar->penguji1 ? $seminar->penguji1->nama : null,
                'penguji_2' => $seminar->penguji2 ? $seminar->penguji2->nama : null,

                // Jadwal
                'tanggal_seminar' => $seminar->tanggal_seminar ? $seminar->tanggal_seminar->toISOString() : null,
                'jam_mulai' => $seminar->jam_mulai_formatted,
                'ruang_seminar' => $seminar->ruang_seminar,

                // Reviews
                'reviews_count' => $seminar->reviews->count(),
                'reviews_approved' => $seminar->reviews->where('status', 'disetujui')->count()
            ];
        });

        // Format data pengujian
        $formattedPengujian = $pengujian->map(function ($seminar) {
            $peran = '';
            if ($seminar->penguji_1_id == auth()->id()) {
                $peran = 'Penguji 1';
            } elseif ($seminar->penguji_2_id == auth()->id()) {
                $peran = 'Penguji 2';
            }

            return [
                'id' => $seminar->id,
                'judul_seminar' => $seminar->judul_seminar,
                'jenis_seminar' => $seminar->jenis_seminar_text,
                'peran' => $peran,
                'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),
                'status' => $seminar->status,
                'status_text' => $seminar->status_text,

                // Info mahasiswa
                'mahasiswa' => $seminar->mahasiswa ? [
                    'nama' => $seminar->mahasiswa->nama,
                    'npm' => $seminar->mahasiswa->npm
                ] : null,

                // Info pembimbing
                'pembimbing_1' => $seminar->pembimbing1 ? $seminar->pembimbing1->nama : null,
                'pembimbing_2' => $seminar->pembimbing2 ? $seminar->pembimbing2->nama : null,

                // Jadwal
                'tanggal_seminar' => $seminar->tanggal_seminar ? $seminar->tanggal_seminar->toISOString() : null,
                'jam_mulai' => $seminar->jam_mulai_formatted,
                'ruang_seminar' => $seminar->ruang_seminar
            ];
        });

        // Format data pending review
        $formattedPendingReview = $pendingReview->map(function ($seminar) {
            $peran = [];
            if ($seminar->pembimbing_1_id == auth()->id()) {
                $peran[] = 'Pembimbing 1';
            }
            if ($seminar->pembimbing_2_id == auth()->id()) {
                $peran[] = 'Pembimbing 2';
            }
            if ($seminar->penguji_1_id == auth()->id()) {
                $peran[] = 'Penguji 1';
            }
            if ($seminar->penguji_2_id == auth()->id()) {
                $peran[] = 'Penguji 2';
            }

            return [
                'id' => $seminar->id,
                'judul_seminar' => $seminar->judul_seminar,
                'jenis_seminar' => $seminar->jenis_seminar_text,
                'peran' => implode(', ', $peran),
                'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),

                // Info mahasiswa
                'mahasiswa' => $seminar->mahasiswa ? [
                    'nama' => $seminar->mahasiswa->nama,
                    'npm' => $seminar->mahasiswa->npm,
                    'konsentrasi' => $seminar->mahasiswa->konsentrasi
                ] : null,

                // Dosen lain
                'pembimbing_1' => $seminar->pembimbing1 ? $seminar->pembimbing1->nama : null,
                'pembimbing_2' => $seminar->pembimbing2 ? $seminar->pembimbing2->nama : null,
                'penguji_1' => $seminar->penguji1 ? $seminar->penguji1->nama : null,
                'penguji_2' => $seminar->penguji2 ? $seminar->penguji2->nama : null,

                // File
                'file_proposal' => $seminar->file_proposal,
                'abstrak' => $seminar->abstrak
            ];
        });

        // Hitung statistik
        $totalBimbingan = $bimbingan->count();
        $bimbinganPending = $bimbingan->where('status', 'pending')->count();
        $totalPengujian = $pengujian->count();
        $pengujianPending = $pengujian->where('status', 'pending')->count();

        // Ambil info kuota
        $kuotaInfo = KuotaSeminar::getAllKuota();

        return response()->json([
            'success' => true,
            'role' => 'dosen',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'npm' => $user->npm,
                'role' => $user->role,
                'konsentrasi' => $user->konsentrasi
            ],
            'stats' => [
                'total_bimbingan' => $totalBimbingan,
                'bimbingan_pending' => $bimbinganPending,
                'bimbingan_disetujui' => $bimbingan->where('status', 'disetujui')->count(),
                'bimbingan_ditolak' => $bimbingan->where('status', 'ditolak')->count(),
                'total_pengujian' => $totalPengujian,
                'pengujian_pending' => $pengujianPending,
                'pengujian_disetujui' => $pengujian->where('status', 'disetujui')->count(),
                'pengujian_ditolak' => $pengujian->where('status', 'ditolak')->count(),
                'total_pending_review' => $pendingReview->count()
            ],
            'bimbingan' => $formattedBimbingan,
            'pengujian' => $formattedPengujian,
            'pending_review' => $formattedPendingReview,
            'kuota_info' => $kuotaInfo,
            'notifications' => $this->getUserNotifications($user->id)
        ]);
    }

    // Dashboard untuk admin
    private function getAdminDashboard($user)
    {
        $allSeminars = Seminar::with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'penguji2'])
            ->orderBy('created_at', 'desc')
            ->get();

        $allUsers = User::all();

        // Format data untuk response
        $formattedSeminars = $allSeminars->map(function ($seminar) {
            return [
                'id' => $seminar->id,
                'judul_seminar' => $seminar->judul_seminar,
                'jenis_seminar' => $seminar->jenis_seminar_text,
                'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),
                'status' => $seminar->status,
                'status_text' => $seminar->status_text,

                // Info mahasiswa
                'mahasiswa' => $seminar->mahasiswa ? [
                    'id' => $seminar->mahasiswa->id,
                    'nama' => $seminar->mahasiswa->nama,
                    'npm' => $seminar->mahasiswa->npm,
                    'konsentrasi' => $seminar->mahasiswa->konsentrasi
                ] : null,

                // Info dosen
                'pembimbing_1' => $seminar->pembimbing1 ? $seminar->pembimbing1->nama : null,
                'pembimbing_2' => $seminar->pembimbing2 ? $seminar->pembimbing2->nama : null,
                'penguji_1' => $seminar->penguji1 ? $seminar->penguji1->nama : null,
                'penguji_2' => $seminar->penguji2 ? $seminar->penguji2->nama : null,

                // Jadwal
                'tanggal_seminar' => $seminar->tanggal_seminar ? $seminar->tanggal_seminar->toISOString() : null,
                'jam_mulai' => $seminar->jam_mulai_formatted,
                'ruang_seminar' => $seminar->ruang_seminar,

                // File
                'file_proposal' => $seminar->file_proposal
            ];
        });

        // Hitung statistik
        $totalSeminars = $allSeminars->count();
        $disetujui = $allSeminars->where('status', 'disetujui')->count();
        $pending = $allSeminars->where('status', 'pending')->count();
        $ditolak = $allSeminars->where('status', 'ditolak')->count();

        $totalUsers = $allUsers->count();
        $mahasiswaCount = $allUsers->where('role', 'mahasiswa')->count();
        $dosenCount = $allUsers->where('role', 'dosen')->count();
        $adminCount = $allUsers->where('role', 'admin')->count();

        // Ambil info kuota
        $kuotaInfo = KuotaSeminar::getAllKuota();

        // Statistik per jenis seminar
        $jenisSeminarStats = [];
        $jenisSeminarList = ['seminar_proposal', 'seminar_hasil', 'seminar_kp', 'seminar_umum', 'sidang_skripsi'];

        foreach ($jenisSeminarList as $jenis) {
            $seminarJenis = $allSeminars->where('jenis_seminar', $jenis);
            $jenisSeminarStats[$jenis] = [
                'total' => $seminarJenis->count(),
                'disetujui' => $seminarJenis->where('status', 'disetujui')->count(),
                'pending' => $seminarJenis->where('status', 'pending')->count(),
                'ditolak' => $seminarJenis->where('status', 'ditolak')->count()
            ];
        }

        return response()->json([
            'success' => true,
            'role' => 'admin',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'npm' => $user->npm,
                'role' => $user->role,
                'konsentrasi' => $user->konsentrasi
            ],
            'stats' => [
                'total_seminars' => $totalSeminars,
                'disetujui' => $disetujui,
                'pending' => $pending,
                'ditolak' => $ditolak,
                'total_users' => $totalUsers,
                'mahasiswa' => $mahasiswaCount,
                'dosen' => $dosenCount,
                'admin' => $adminCount
            ],
            'jenis_seminar_stats' => $jenisSeminarStats,
            'seminars' => $formattedSeminars,
            'kuota_info' => $kuotaInfo,
            'notifications' => $this->getUserNotifications($user->id)
        ]);
    }

    // Get user notifications
    private function getUserNotifications($userId)
    {
        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'judul' => $notification->judul,
                'pesan' => $notification->pesan,
                'tipe' => $notification->tipe,
                'dibaca' => $notification->dibaca,
                'created_at' => $notification->created_at->toISOString()
            ];
        });
    }

    // Get seminar detail
    public function getSeminarDetail($id)
    {
        $seminar = Seminar::with(['mahasiswa', 'pembimbing1', 'pembimbing2', 'penguji1', 'penguji2', 'reviews.dosen'])
            ->find($id);

        if (!$seminar) {
            return response()->json([
                'success' => false,
                'message' => 'Seminar tidak ditemukan'
            ], 404);
        }

        // Format data seminar
        $formattedSeminar = [
            'id' => $seminar->id,
            'judul_seminar' => $seminar->judul_seminar,
            'jenis_seminar' => $seminar->jenis_seminar,
            'jenis_seminar_text' => $seminar->jenis_seminar_text,
            'abstrak' => $seminar->abstrak,
            'file_proposal' => $seminar->file_proposal,
            'status' => $seminar->status,
            'status_text' => $seminar->status_text,
            'catatan' => $seminar->catatan,
            'nilai' => $seminar->nilai,
            'tanggal_daftar' => $seminar->tanggal_daftar->toISOString(),
            'tanggal_review' => $seminar->tanggal_review ? $seminar->tanggal_review->toISOString() : null,

            // Jadwal
            'tanggal_seminar' => $seminar->tanggal_seminar ? $seminar->tanggal_seminar->toISOString() : null,
            'jam_mulai' => $seminar->jam_mulai_formatted,
            'jam_selesai' => $seminar->jam_selesai_formatted,
            'ruang_seminar' => $seminar->ruang_seminar,

            // Info mahasiswa
            'mahasiswa' => $seminar->mahasiswa ? [
                'id' => $seminar->mahasiswa->id,
                'nama' => $seminar->mahasiswa->nama,
                'npm' => $seminar->mahasiswa->npm,
                'email' => $seminar->mahasiswa->email,
                'konsentrasi' => $seminar->mahasiswa->konsentrasi
            ] : null,

            // Info dosen
            'pembimbing_1' => $seminar->pembimbing1 ? [
                'id' => $seminar->pembimbing1->id,
                'nama' => $seminar->pembimbing1->nama,
                'email' => $seminar->pembimbing1->email,
                'konsentrasi' => $seminar->pembimbing1->konsentrasi
            ] : null,

            'pembimbing_2' => $seminar->pembimbing2 ? [
                'id' => $seminar->pembimbing2->id,
                'nama' => $seminar->pembimbing2->nama,
                'email' => $seminar->pembimbing2->email,
                'konsentrasi' => $seminar->pembimbing2->konsentrasi
            ] : null,

            'penguji_1' => $seminar->penguji1 ? [
                'id' => $seminar->penguji1->id,
                'nama' => $seminar->penguji1->nama,
                'email' => $seminar->penguji1->email,
                'konsentrasi' => $seminar->penguji1->konsentrasi
            ] : null,

            'penguji_2' => $seminar->penguji2 ? [
                'id' => $seminar->penguji2->id,
                'nama' => $seminar->penguji2->nama,
                'email' => $seminar->penguji2->email,
                'konsentrasi' => $seminar->penguji2->konsentrasi
            ] : null,

            // Reviews
            'reviews' => $seminar->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'dosen' => $review->dosen ? [
                        'id' => $review->dosen->id,
                        'nama' => $review->dosen->nama
                    ] : null,
                    'peran' => $review->peran,
                    'status' => $review->status,
                    'catatan' => $review->catatan,
                    'file_review' => $review->file_review,
                    'tanggal_review' => $review->tanggal_review->toISOString(),
                    'nilai_komponen_1' => $review->nilai_komponen_1,
                    'nilai_komponen_2' => $review->nilai_komponen_2,
                    'nilai_komponen_3' => $review->nilai_komponen_3,
                    'nilai_komponen_4' => $review->nilai_komponen_4,
                    'nilai_komponen_5' => $review->nilai_komponen_5,
                    'nilai_akhir' => $review->nilai_akhir,
                    'tanggal_alternatif' => $review->tanggal_alternatif ? $review->tanggal_alternatif->toISOString() : null,
                    'jam_alternatif' => $review->jam_alternatif,
                    'ruang_alternatif' => $review->ruang_alternatif
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'seminar' => $formattedSeminar
        ]);
    }

    // Get user profile
    public function getProfile()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'npm' => $user->npm,
                'role' => $user->role,
                'konsentrasi' => $user->konsentrasi,
                'created_at' => $user->created_at->toISOString()
            ]
        ]);
    }

    // Get kuota info (public method untuk diakses dari luar)
    public function getKuotaInfo()
    {
        $kuota = KuotaSeminar::getAllKuota();

        return response()->json([
            'success' => true,
            'data' => $kuota
        ]);
    }

    // Get all users (untuk admin)
    public function getAllUsers()
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'nama' => $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'npm' => $user->npm,
                'role' => $user->role,
                'konsentrasi' => $user->konsentrasi,
                'created_at' => $user->created_at->toISOString()
            ];
        });

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    // Get seminar statistics
    public function getSeminarStatistics()
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $allSeminars = Seminar::all();

        // Statistik umum
        $total = $allSeminars->count();
        $disetujui = $allSeminars->where('status', 'disetujui')->count();
        $pending = $allSeminars->where('status', 'pending')->count();
        $ditolak = $allSeminars->where('status', 'ditolak')->count();

        // Statistik per bulan (6 bulan terakhir)
        $monthlyStats = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $monthSeminars = Seminar::whereBetween('tanggal_daftar', [$monthStart, $monthEnd])->get();

            $monthlyStats[] = [
                'month' => $month->format('Y-m'),
                'month_name' => $month->format('F Y'),
                'total' => $monthSeminars->count(),
                'disetujui' => $monthSeminars->where('status', 'disetujui')->count(),
                'pending' => $monthSeminars->where('status', 'pending')->count(),
                'ditolak' => $monthSeminars->where('status', 'ditolak')->count()
            ];
        }

        // Statistik per jenis seminar
        $jenisSeminarStats = [];
        $jenisSeminarList = ['seminar_proposal', 'seminar_hasil', 'seminar_kp', 'seminar_umum', 'sidang_skripsi'];

        foreach ($jenisSeminarList as $jenis) {
            $seminarJenis = $allSeminars->where('jenis_seminar', $jenis);
            $jenisSeminarStats[$jenis] = [
                'total' => $seminarJenis->count(),
                'disetujui' => $seminarJenis->where('status', 'disetujui')->count(),
                'pending' => $seminarJenis->where('status', 'pending')->count(),
                'ditolak' => $seminarJenis->where('status', 'ditolak')->count()
            ];
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'total' => $total,
                'disetujui' => $disetujui,
                'pending' => $pending,
                'ditolak' => $ditolak
            ],
            'monthly_stats' => $monthlyStats,
            'jenis_seminar_stats' => $jenisSeminarStats
        ]);
    }
}
