import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import DaftarSeminar from './DaftarSeminar';
import DetailPendaftaran from './DetailPendaftaran';
import ReviewPendaftaran from './ReviewPendaftaran';
import ProtectedRoute from './ProtectedRoute';
import ToastProvider from './components/ToastProvider';
import UbahJadwal from './UbahJadwal';

function App() {
	return (
		<>
			<ToastProvider />
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/daftar-seminar"
						element={
							<ProtectedRoute>
								<DaftarSeminar />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/detail-pendaftaran/:id"
						element={
							<ProtectedRoute>
								<DetailPendaftaran />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/review-pendaftaran/:id"
						element={
							<ProtectedRoute requiredRole="dosen">
								<ReviewPendaftaran />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/ubah-jadwal/:id"
						element={
							<ProtectedRoute>
								<UbahJadwal />
							</ProtectedRoute>
						}
					/>
					<Route path="/" element={<Login />} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
