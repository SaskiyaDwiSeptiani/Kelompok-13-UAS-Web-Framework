import apiClient from '../client';

export const seminarAPI = {
	daftarSeminar: async (formData) => {
		const response = await apiClient.post('/seminar/daftar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	getSeminarDetail: async (id) => {
		const response = await apiClient.get(`/seminar/${id}`);
		return response.data;
	},

	// Review endpoints
	createReview: async (formData) => {
		const response = await apiClient.post(`/review/${formData.seminar_id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	updateReview: async (reviewId, formData) => {
		const response = await apiClient.put(`/review/${reviewId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	getDosen: async () => {
		const response = await apiClient.get('/dosen');
		return response.data;
	},

	getKuotaSeminar: async () => {
		const response = await apiClient.get('/kuota');
		return response.data;
	},

	updateJadwalSeminar: async (id, data) => {
		const response = await apiClient.patch(`/seminar/${id}`, data);
		return response.data;
	},
};
