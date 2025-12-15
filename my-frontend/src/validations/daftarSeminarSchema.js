import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const daftarSeminarSchema = z.object({
	jenis_seminar: z.enum(['seminar_proposal', 'seminar_hasil', 'seminar_kp', 'seminar_umum', 'sidang_skripsi'], {
		required_error: 'Jenis seminar wajib dipilih',
		invalid_type_error: 'Jenis seminar tidak valid',
	}),

	judul_seminar: z.string().min(1, 'Judul seminar wajib diisi').max(255, 'Judul seminar maksimal 255 karakter'),

	abstrak: z.string().min(1, 'Abstrak wajib diisi'),

	file_proposal: z
		.any()
		.refine((files) => files?.length > 0, 'File proposal wajib diupload')
		.refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Ukuran file maksimal 5MB')
		.refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), 'Format file harus PDF, DOC, atau DOCX'),

	pembimbing_1_id: z.string().min(1, 'Pembimbing 1 wajib dipilih'),

	pembimbing_2_id: z.string().optional(),

	penguji_1_id: z.string().optional(),

	penguji_2_id: z.string().optional(),

	tanggal_seminar: z
		.string()
		.min(1, 'Tanggal seminar wajib diisi')
		.refine((date) => {
			const selectedDate = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return selectedDate >= today;
		}, 'Tanggal seminar harus hari ini atau setelahnya'),

	jam_mulai: z
		.string()
		.min(1, 'Jam mulai wajib dipilih')
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid (HH:mm)'),

	ruang_seminar: z.string().min(1, 'Ruang seminar wajib diisi').max(255, 'Ruang seminar maksimal 255 karakter'),
});
