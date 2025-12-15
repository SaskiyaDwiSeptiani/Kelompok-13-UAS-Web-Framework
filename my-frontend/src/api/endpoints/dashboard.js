import apiClient from '../client';

export const dashboardAPI = {
	getDashboard: async (data) => {
		const response = await apiClient.get(`/dashboard`);
		return response.data;
	},
};
