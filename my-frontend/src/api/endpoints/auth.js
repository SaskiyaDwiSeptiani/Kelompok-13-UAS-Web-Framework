import apiClient from '../client';

export const authAPI = {
	register: async (data) => {
		const response = await apiClient.post(`/register`, data);
		return response.data;
	},

	login: async (data) => {
		let path = '/login';
		if (data.userType === 'mahasiswa') path = '/login/npm';
		const response = await apiClient.post(path, data);
		return response.data;
	},
};
