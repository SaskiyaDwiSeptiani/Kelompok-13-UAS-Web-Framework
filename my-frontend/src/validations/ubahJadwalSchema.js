import { z } from 'zod';

export const ubahJadwalSchema = z.object({
	tanggal_seminar: z
		.string()
		.min(1, 'Tanggal seminar wajib diisi')
		.refine((date) => {
			const selectedDate = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return selectedDate >= today;
		}, 'Tanggal seminar harus hari ini atau setelahnya'),

	jam_mulai: z.string().min(1, 'Jam mulai wajib dipilih'),

	ruang_seminar: z.string().min(1, 'Ruang seminar wajib dipilih'),
});
