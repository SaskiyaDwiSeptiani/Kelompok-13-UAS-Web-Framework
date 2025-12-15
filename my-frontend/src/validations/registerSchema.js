import { z } from 'zod';

export const registerSchema = z
	.object({
		nama: z.string().min(1, 'Nama lengkap wajib diisi').max(255, 'Nama lengkap maksimal 255 karakter'),
		email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
		username: z.string().min(1, 'Username wajib diisi'),
		password: z.string().min(1, 'Password wajib diisi').min(6, 'Password minimal 6 karakter'),
		role: z.enum(['mahasiswa', 'dosen'], {
			errorMap: () => ({ message: 'Role harus dipilih (mahasiswa atau dosen)' }),
		}),
		npm: z
			.string()
			.optional()
			.refine((val) => !val || /^\d+$/.test(val), 'NPM harus berupa angka'),
		konsentrasi: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		// Validasi conditional: jika role mahasiswa, npm dan konsentrasi wajib
		if (data.role === 'mahasiswa') {
			if (!data.npm) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['npm'],
					message: 'NPM wajib diisi untuk mahasiswa',
				});
			}
			if (!data.konsentrasi) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['konsentrasi'],
					message: 'Konsentrasi wajib dipilih untuk mahasiswa',
				});
			}
		}
	});
