<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Seminar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * Submit Review Pertama Kali
     */
    public function store(Request $request, $seminarId)
    {
        $request->validate([
            'status' => 'in:menunggu,direview,disetujui,ditolak,revisi',
            'catatan' => 'nullable|string',
            'file_review' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'nilai_komponen_1' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_2' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_3' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_4' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_5' => 'nullable|integer|min:0|max:100',
            'tanggal_review' => 'nullable|date',
            'tanggal_alternatif' => 'nullable|date',
            'jam_alternatif' => 'nullable|date_format:H:i',
            'ruang_alternatif' => 'nullable|string',
        ]);

        $seminar = Seminar::findOrFail($seminarId);
        $dosenId = Auth::id();
        $peran = $this->detectReviewerRole($seminar, $dosenId);

        if (!$peran) {
            return response()->json(['message' => 'Anda tidak memiliki peran sebagai reviewer pada seminar ini.'], 403);
        }

        if (Review::where('seminar_id', $seminarId)
            ->where('dosen_id', $dosenId)
            ->where('peran', $peran)
            ->exists()
        ) {
            return response()->json(['message' => 'Review sudah pernah dibuat.'], 422);
        }

        $data = [
            'seminar_id' => $seminarId,
            'dosen_id' => $dosenId,
            'peran' => $peran,
            'status' => $request->status ?? 'direview',
            'catatan' => $request->catatan,
            'tanggal_review' => now(),
            'nilai_komponen_1' => $request->nilai_komponen_1,
            'nilai_komponen_2' => $request->nilai_komponen_2,
            'nilai_komponen_3' => $request->nilai_komponen_3,
            'nilai_komponen_4' => $request->nilai_komponen_4,
            'nilai_komponen_5' => $request->nilai_komponen_5,
            'tanggal_alternatif' => $request->tanggal_alternatif,
            'jam_alternatif' => $request->jam_alternatif,
            'ruang_alternatif' => $request->ruang_alternatif,
        ];

        if ($request->hasFile('file_review')) {
            $data['file_review'] = $request->file('file_review')->store('review_files', 'public');
        }

        // Hitung nilai akhir jika semua komponen terisi
        $nilai = collect([
            $request->nilai_komponen_1,
            $request->nilai_komponen_2,
            $request->nilai_komponen_3,
            $request->nilai_komponen_4,
            $request->nilai_komponen_5,
        ]);

        if ($nilai->filter()->count() === 5) {
            $data['nilai_akhir'] = round($nilai->avg(), 2);
        }

        $review = Review::create($data);

        $this->updateSeminarStatus($seminarId);

        return response()->json([
            'message' => 'Review berhasil dibuat',
            'data' => $review,
            'success' => true
        ], 201);
    }

    /**
     * Update Review yang sudah ada
     */
    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        if ($review->dosen_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak memiliki akses memperbarui review ini.'], 403);
        }

        $request->validate([
            'status' => 'in:menunggu,direview,disetujui,ditolak,revisi',
            'catatan' => 'nullable|string',
            'file_review' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'nilai_komponen_1' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_2' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_3' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_4' => 'nullable|integer|min:0|max:100',
            'nilai_komponen_5' => 'nullable|integer|min:0|max:100',
            'tanggal_alternatif' => 'nullable|date',
            'jam_alternatif' => 'nullable|date_format:H:i',
            'ruang_alternatif' => 'nullable|string',
        ]);

        $review->fill($request->all());

        if ($request->hasFile('file_review')) {
            if ($review->file_review) {
                Storage::disk('public')->delete($review->file_review);
            }
            $review->file_review = $request->file('file_review')->store('review_files', 'public');
        }

        // Hitung nilai akhir jika lengkap
        $nilai = collect([
            $review->nilai_komponen_1,
            $review->nilai_komponen_2,
            $review->nilai_komponen_3,
            $review->nilai_komponen_4,
            $review->nilai_komponen_5,
        ]);

        if ($nilai->filter()->count() === 5) {
            $review->nilai_akhir = round($nilai->avg(), 2);
        }

        $review->tanggal_review = now();
        $review->save();

        $this->updateSeminarStatus($review->seminar_id);

        return response()->json([
            'message' => 'Review berhasil diperbarui',
            'data' => $review,
            'success' => true
        ], 200);
    }

    private function updateSeminarStatus($seminarId)
    {
        $seminar = Seminar::find($seminarId);
        if (!$seminar) return;

        $reviews = Review::where('seminar_id', $seminarId)->get();

        if ($reviews->count() < 4) {
            return; // Belum semua reviewer memberi status
        }

        if ($reviews->every(fn($r) => $r->status === 'disetujui')) {
            $seminar->status = 'disetujui';
        } elseif ($reviews->every(fn($r) => $r->status === 'ditolak')) {
            $seminar->status = 'ditolak';
        } else {
            $seminar->status = 'pending'; // atau tetap kondisi sebelumnya
        }

        $seminar->save();
    }

    private function detectReviewerRole($seminar, $dosenId)
    {
        if ($seminar->pembimbing_1_id == $dosenId) return 'pembimbing_1';
        if ($seminar->pembimbing_2_id == $dosenId) return 'pembimbing_2';
        if ($seminar->penguji_1_id == $dosenId) return 'penguji_1';
        if ($seminar->penguji_2_id == $dosenId) return 'penguji_2';

        return null; // berarti dosen tidak memiliki peran di seminar ini
    }
}
