import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
	const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
	const token = localStorage.getItem('token');

	// Get user dari localStorage
	let userRole = null;
	try {
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		userRole = user.role;
	} catch (error) {
		console.error('Error parsing user data:', error);
	}

	if (!isAuthenticated || !token) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && userRole !== requiredRole) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}

export default ProtectedRoute;
