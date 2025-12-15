import apiClient from '../client';

export const reviewAPI = {
	createReview: async (seminarId) => {
		const response = await apiClient.post(`/review/${seminarId}`);
		return response.data;
	},

	updateReview: async (id) => {
		const response = await apiClient.put(`/review/${id}`);
		return response.data;
	},
};
