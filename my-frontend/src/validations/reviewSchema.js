import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const reviewSchema = z.object({
	peran: z.enum(['pembimbing_1', 'pembimbing_2', 'penguji_1', 'penguji_2'], {
		required_error: 'Peran wajib dipilih',
		invalid_type_error: 'Peran tidak valid',
	}),

	status: z.enum(['menunggu', 'direview', 'disetujui', 'ditolak', 'revisi'], {
		required_error: 'Status wajib dipilih',
		invalid_type_error: 'Status tidak valid',
	}),

	catatan: z.string().optional(),

	file_review: z
		.any()
		.optional()
		.refine((files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE, 'Ukuran file maksimal 2MB')
		.refine((files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files[0]?.type), 'Format file harus PDF, DOC, atau DOCX'),

	// Nilai komponen (opsional)
	nilai_komponen_1: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Nilai harus antara 0-100'),

	nilai_komponen_2: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Nilai harus antara 0-100'),

	nilai_komponen_3: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Nilai harus antara 0-100'),

	nilai_komponen_4: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Nilai harus antara 0-100'),

	nilai_komponen_5: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Nilai harus antara 0-100'),

	tanggal_alternatif: z.string().optional().nullable(),

	jam_alternatif: z.string().optional().nullable(),

	ruang_alternatif: z.string().optional().nullable(),
});

// Schema untuk update (tanpa peran karena tidak bisa diubah)
export const updateReviewSchema = reviewSchema.omit({ peran: true });
