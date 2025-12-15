import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI } from './api/endpoints/dashboard';
import { useToast } from './hooks/useToast';
import DashboardMahasiswa from './components/DashboardMahasiswa';
import DashboardDosen from './components/DashboardDosen';
import DashboardAdmin from './components/DashboardAdmin';

function Dashboard() {
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const [dashboardData, setDashboardData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	const loadDashboardData = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await dashboardAPI.getDashboard();

			if (response.success) {
				setDashboardData(response);
			}
		} catch (err) {
			console.error('Error loading dashboard:', err);
			if (err.response?.status === 401) {
				showError('Sesi Anda telah berakhir. Silakan login kembali.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else {
				setError(err.response?.data?.message || 'Gagal memuat data dashboard');
				showError('Gagal memuat data dashboard');
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}
		loadDashboardData();
		
		// Update waktu setiap detik
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		
		return () => clearInterval(timer);
	}, [navigate]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		showSuccess('Berhasil logout');
		navigate('/login');
	};

	const handleDaftarSeminar = () => {
		navigate('/daftar-seminar');
	};

	const handleDetailPendaftaran = (id) => {
		navigate(`/detail-pendaftaran/${id}`);
	};

	const handleReviewPendaftaran = (id) => {
		navigate(`/review-pendaftaran/${id}`);
	};

	if (isLoading) {
		return (
			<div className="unila-loading d-flex justify-content-center align-items-center" style={{ height: '100vh', background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)' }}>
				<div className="text-center">
					<div className="position-relative">
						<div className="unila-spinner spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="position-absolute top-50 start-50 translate-middle" style={{ width: '3rem', height: '3rem' }}>
							<div className="spinner-grow text-warning" role="status" style={{ width: '2rem', height: '2rem' }}>
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					</div>
					<p className="mt-4 text-primary fw-bold fs-5">Memuat Dashboard...</p>
					<p className="text-muted">Sistem Seminar TI - Universitas Lampung</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mt-5">
				<div className="alert alert-danger unila-card animate__animated animate__shakeX">
					<div className="d-flex align-items-center">
						<div className="flex-shrink-0">
							<i className="fas fa-exclamation-triangle fs-2 text-danger"></i>
						</div>
						<div className="flex-grow-1 ms-3">
							<h4 className="unila-text-primary mb-2">Terjadi Kesalahan</h4>
							<p className="mb-3">{error}</p>
							<button className="btn unila-btn-primary" onClick={loadDashboardData}>
								<i className="fas fa-redo me-2"></i>
								Muat Ulang Dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!dashboardData) {
		return null;
	}

	// Function to get role display name
	const getRoleDisplayName = (role) => {
		const roleNames = {
			'mahasiswa': 'Mahasiswa',
			'dosen': 'Dosen Pembimbing',
			'admin': 'Administrator Sistem'
		};
		return roleNames[role] || role;
	};

	// Function to get role icon
	const getRoleIcon = (role) => {
		const icons = {
			'mahasiswa': 'fas fa-user-graduate',
			'dosen': 'fas fa-chalkboard-teacher',
			'admin': 'fas fa-user-shield'
		};
		return icons[role] || 'fas fa-user';
	};

	// Function to get greeting based on time
	const getGreeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return 'Selamat Pagi';
		if (hour < 15) return 'Selamat Siang';
		if (hour < 19) return 'Selamat Sore';
		return 'Selamat Malam';
	};

	return (
		<div className="unila-dashboard">
			{/* Custom CSS for UNILA Theme */}
			<style>
				{`
					/* UNILA Color Palette - Enhanced */
					:root {
						--unila-primary: #00509E;
						--unila-primary-dark: #003A75;
						--unila-primary-light: #4D82BC;
						--unila-primary-soft: #E8F2FF;
						--unila-secondary: #FFB81C;
						--unila-secondary-light: #FFD166;
						--unila-accent: #28A745;
						--unila-danger: #DC3545;
						--unila-warning: #FFC107;
						--unila-info: #17A2B8;
						--unila-light: #F8F9FA;
						--unila-dark: #212529;
						--unila-gradient-primary: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						--unila-gradient-secondary: linear-gradient(135deg, #FFB81C 0%, #FFD166 100%);
					}
					
					/* Animations */
					@keyframes fadeInUp {
						from {
							opacity: 0;
							transform: translateY(20px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}
					
					@keyframes float {
						0%, 100% {
							transform: translateY(0);
						}
						50% {
							transform: translateY(-10px);
						}
					}
					
					/* Navigation Bar - Premium Style */
					.unila-navbar {
						background: var(--unila-gradient-primary);
						box-shadow: 0 4px 20px rgba(0, 80, 158, 0.25);
						padding: 0.8rem 0;
						border-bottom: 4px solid var(--unila-secondary);
						position: sticky;
						top: 0;
						z-index: 1030;
					}
					
					.unila-navbar-brand {
						font-weight: 800;
						font-size: 1.5rem;
						color: white !important;
						text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
						letter-spacing: 0.5px;
						display: flex;
						align-items: center;
					}
					
					.unila-navbar-brand i {
						color: var(--unila-secondary);
						font-size: 1.8rem;
						margin-right: 10px;
						animation: float 3s ease-in-out infinite;
					}
					
					.unila-user-info {
						background: rgba(255, 255, 255, 0.15);
						border-radius: 25px;
						padding: 0.5rem 1.2rem;
						backdrop-filter: blur(15px);
						border: 1px solid rgba(255, 255, 255, 0.25);
						transition: all 0.3s ease;
						box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
					}
					
					.unila-user-info:hover {
						background: rgba(255, 255, 255, 0.25);
						transform: translateY(-2px);
					}
					
					.unila-user-name {
						color: white;
						font-weight: 700;
						font-size: 1rem;
						display: flex;
						align-items: center;
						gap: 8px;
					}
					
					.unila-user-role {
						color: var(--unila-secondary);
						font-weight: 600;
						font-size: 0.85rem;
						display: flex;
						align-items: center;
						gap: 6px;
					}
					
					.unila-logout-btn {
						background: var(--unila-gradient-secondary);
						color: var(--unila-primary-dark) !important;
						border-radius: 25px;
						padding: 0.6rem 1.8rem !important;
						font-weight: 700;
						transition: all 0.3s ease;
						border: none;
						box-shadow: 0 4px 15px rgba(255, 184, 28, 0.3);
						display: flex;
						align-items: center;
						gap: 8px;
					}
					
					.unila-logout-btn:hover {
						background: white;
						color: var(--unila-primary) !important;
						transform: translateY(-3px) scale(1.05);
						box-shadow: 0 8px 25px rgba(255, 184, 28, 0.4);
					}
					
					/* Main Container */
					.unila-container {
						background: linear-gradient(135deg, #f0f7ff 0%, #e3efff 100%);
						min-height: calc(100vh - 76px);
						padding: 2.5rem 0;
						animation: fadeInUp 0.8s ease-out;
					}
					
					/* Welcome Card - Premium */
					.unila-welcome-card {
						background: linear-gradient(135deg, var(--unila-primary) 0%, var(--unila-primary-dark) 100%);
						border-radius: 20px;
						color: white;
						padding: 2.5rem;
						margin-bottom: 2.5rem;
						box-shadow: 0 15px 40px rgba(0, 80, 158, 0.25);
						border: none;
						position: relative;
						overflow: hidden;
						animation: fadeInUp 0.6s ease-out 0.2s both;
					}
					
					.unila-welcome-card::before {
						content: '';
						position: absolute;
						top: 0;
						right: 0;
						width: 200px;
						height: 200px;
						background: radial-gradient(circle, rgba(255, 184, 28, 0.2) 0%, transparent 70%);
						border-radius: 50%;
					}
					
					.unila-welcome-icon {
						font-size: 3.5rem;
						color: var(--unila-secondary);
						margin-bottom: 1.5rem;
						animation: float 4s ease-in-out infinite;
					}
					
					.unila-welcome-title {
						font-size: 2.2rem;
						font-weight: 800;
						margin-bottom: 0.8rem;
						line-height: 1.2;
					}
					
					.unila-welcome-subtitle {
						font-size: 1.2rem;
						opacity: 0.9;
						margin-bottom: 1.5rem;
					}
					
					.unila-time-display {
						background: rgba(255, 255, 255, 0.15);
						padding: 0.8rem 1.5rem;
						border-radius: 15px;
						display: inline-flex;
						align-items: center;
						gap: 10px;
						backdrop-filter: blur(10px);
						border: 1px solid rgba(255, 255, 255, 0.2);
					}
					
					.unila-time-display i {
						color: var(--unila-secondary);
					}
					
					.unila-user-avatar {
						width: 140px;
						height: 140px;
						background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
						border: 5px solid rgba(255, 255, 255, 0.3);
						overflow: hidden;
						transition: all 0.3s ease;
					}
					
					.unila-user-avatar:hover {
						transform: scale(1.05) rotate(5deg);
						box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
					}
					
					.unila-user-avatar i {
						font-size: 5rem;
						background: linear-gradient(135deg, var(--unila-primary) 0%, var(--unila-primary-light) 100%);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
					}
					
					/* Dashboard Header */
					.unila-dashboard-header {
						background: white;
						border-radius: 15px;
						padding: 1.5rem;
						margin-bottom: 2rem;
						box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
						display: flex;
						align-items: center;
						justify-content: space-between;
						animation: fadeInUp 0.6s ease-out 0.4s both;
					}
					
					.unila-dashboard-title {
						color: var(--unila-primary);
						font-weight: 700;
						font-size: 1.8rem;
						margin: 0;
						display: flex;
						align-items: center;
						gap: 12px;
					}
					
					.unila-dashboard-title i {
						color: var(--unila-secondary);
						font-size: 2rem;
					}
					
					.unila-role-badge {
						background: linear-gradient(135deg, var(--unila-primary-light) 0%, var(--unila-primary) 100%);
						color: white;
						padding: 0.5rem 1.2rem;
						border-radius: 25px;
						font-weight: 600;
						font-size: 0.9rem;
						display: flex;
						align-items: center;
						gap: 8px;
						box-shadow: 0 4px 15px rgba(0, 80, 158, 0.2);
					}
					
					/* Stats Cards Enhanced */
					.unila-stat-card {
						background: white;
						border-radius: 15px;
						padding: 2rem;
						margin-bottom: 1.5rem;
						box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
						border: none;
						transition: all 0.4s ease;
						border-left: 5px solid var(--unila-primary);
						position: relative;
						overflow: hidden;
						animation: fadeInUp 0.6s ease-out;
					}
					
					.unila-stat-card:hover {
						transform: translateY(-8px) scale(1.02);
						box-shadow: 0 15px 40px rgba(0, 80, 158, 0.15);
						border-left: 5px solid var(--unila-secondary);
					}
					
					.unila-stat-card::after {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 4px;
						background: linear-gradient(90deg, var(--unila-primary) 0%, var(--unila-secondary) 100%);
					}
					
					.unila-stat-icon-wrapper {
						width: 70px;
						height: 70px;
						border-radius: 15px;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-bottom: 1.5rem;
						font-size: 2rem;
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.1) 0%, rgba(77, 130, 188, 0.1) 100%);
						color: var(--unila-primary);
					}
					
					.unila-stat-number {
						font-size: 2.5rem;
						font-weight: 800;
						color: var(--unila-primary);
						line-height: 1;
						margin-bottom: 0.5rem;
					}
					
					.unila-stat-label {
						font-size: 1rem;
						color: #6c757d;
						font-weight: 600;
					}
					
					.unila-stat-trend {
						font-size: 0.85rem;
						font-weight: 500;
						margin-top: 0.5rem;
						display: flex;
						align-items: center;
						gap: 5px;
					}
					
					.unila-stat-trend.positive {
						color: var(--unila-accent);
					}
					
					.unila-stat-trend.negative {
						color: var(--unila-danger);
					}
					
					/* Buttons Enhanced */
					.unila-btn-primary {
						background: var(--unila-gradient-primary);
						border: none;
						color: white;
						padding: 0.9rem 2rem;
						border-radius: 12px;
						font-weight: 700;
						transition: all 0.3s ease;
						box-shadow: 0 6px 20px rgba(0, 80, 158, 0.25);
						display: inline-flex;
						align-items: center;
						justify-content: center;
						gap: 10px;
					}
					
					.unila-btn-primary:hover {
						transform: translateY(-3px) scale(1.05);
						box-shadow: 0 12px 30px rgba(0, 80, 158, 0.35);
						color: white;
					}
					
					.unila-btn-secondary {
						background: white;
						border: 2px solid var(--unila-primary);
						color: var(--unila-primary);
						padding: 0.9rem 2rem;
						border-radius: 12px;
						font-weight: 700;
						transition: all 0.3s ease;
						box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
					}
					
					.unila-btn-secondary:hover {
						background: var(--unila-primary);
						color: white;
						transform: translateY(-3px);
						box-shadow: 0 8px 25px rgba(0, 80, 158, 0.2);
					}
					
					/* Loading Spinner Enhanced */
					.unila-spinner {
						border-width: 0.4em;
						border-top-color: var(--unila-primary);
						border-right-color: rgba(0, 80, 158, 0.1);
						border-bottom-color: rgba(0, 80, 158, 0.1);
						border-left-color: rgba(0, 80, 158, 0.1);
						animation: spin 1s linear infinite;
					}
					
					@keyframes spin {
						0% { transform: rotate(0deg); }
						100% { transform: rotate(360deg); }
					}
					
					/* Cards Enhanced */
					.unila-card {
						border: none;
						border-radius: 15px;
						box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
						transition: all 0.4s ease;
						background: white;
						animation: fadeInUp 0.6s ease-out;
					}
					
					.unila-card:hover {
						transform: translateY(-5px);
						box-shadow: 0 15px 40px rgba(0, 80, 158, 0.15);
					}
					
					.unila-card-header {
						background: var(--unila-gradient-primary);
						color: white;
						border-radius: 15px 15px 0 0 !important;
						padding: 1.2rem 1.8rem;
						font-weight: 700;
						font-size: 1.2rem;
						display: flex;
						align-items: center;
						gap: 12px;
					}
					
					.unila-text-primary {
						color: var(--unila-primary) !important;
					}
					
					/* Footer Enhanced */
					.unila-footer {
						background: var(--unila-gradient-primary);
						color: white;
						padding: 2.5rem 0;
						margin-top: 4rem;
						border-top: 4px solid var(--unila-secondary);
						position: relative;
						overflow: hidden;
					}
					
					.unila-footer::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 4px;
						background: linear-gradient(90deg, var(--unila-secondary) 0%, transparent 50%, var(--unila-secondary) 100%);
					}
					
					.unila-footer h5 {
						font-weight: 700;
						color: var(--unila-secondary);
						margin-bottom: 1.5rem;
						display: flex;
						align-items: center;
						gap: 10px;
					}
					
					.unila-footer p {
						opacity: 0.9;
						line-height: 1.8;
					}
					
					.unila-footer a {
						color: var(--unila-secondary-light);
						text-decoration: none;
						transition: all 0.3s ease;
					}
					
					.unila-footer a:hover {
						color: white;
						text-decoration: underline;
						transform: translateX(5px);
					}
					
					/* Responsive Design */
					@media (max-width: 768px) {
						.unila-welcome-card {
							padding: 1.8rem;
						}
						
						.unila-welcome-title {
							font-size: 1.8rem;
						}
						
						.unila-dashboard-header {
							flex-direction: column;
							gap: 1rem;
							text-align: center;
						}
						
						.unila-user-avatar {
							width: 100px;
							height: 100px;
						}
						
						.unila-user-avatar i {
							font-size: 3.5rem;
						}
						
						.unila-stat-card {
							padding: 1.5rem;
						}
						
						.unila-stat-number {
							font-size: 2rem;
						}
					}
					
					/* Scrollbar Styling */
					::-webkit-scrollbar {
						width: 8px;
					}
					
					::-webkit-scrollbar-track {
						background: var(--unila-primary-soft);
					}
					
					::-webkit-scrollbar-thumb {
						background: var(--unila-primary-light);
						border-radius: 4px;
					}
					
					::-webkit-scrollbar-thumb:hover {
						background: var(--unila-primary);
					}
				`}
			</style>

			{/* Navigation Bar */}
			<nav className="navbar navbar-expand-lg unila-navbar">
				<div className="container">
					<Link className="navbar-brand unila-navbar-brand" to="/dashboard">
						<i className="fas fa-graduation-cap"></i>
						SEMINAR TI - UNIVERSITAS LAMPUNG
					</Link>
					<div className="navbar-nav ms-auto align-items-center">
						<div className="unila-user-info me-3">
							<div className="unila-user-name">
								<i className="fas fa-user-circle"></i>
								{dashboardData.user.nama}
							</div>
							<div className="unila-user-role">
								<i className={getRoleIcon(dashboardData.role)}></i>
								{getRoleDisplayName(dashboardData.role)}
							</div>
						</div>
						<button className="btn unila-logout-btn" onClick={handleLogout}>
							<i className="fas fa-sign-out-alt"></i>
							Logout
						</button>
					</div>
				</div>
			</nav>

			<div className="unila-container">
				<div className="container">
					{/* Welcome Section */}
					<div className="unila-welcome-card">
						<div className="row align-items-center">
							<div className="col-md-8">
								<div className="unila-welcome-icon">
									<i className="fas fa-university"></i>
								</div>
								<h1 className="unila-welcome-title">
									{getGreeting()}, {dashboardData.user.nama.split(' ')[0]}!
								</h1>
								<p className="unila-welcome-subtitle">
									Selamat datang di Sistem Seminar Teknologi Informasi<br />
									Fakultas Teknik - Universitas Lampung
								</p>
								<div className="unila-time-display">
									<i className="fas fa-clock"></i>
									<span>
										{currentTime.toLocaleDateString('id-ID', { 
											weekday: 'long', 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
										})}
									</span>
									<span className="mx-2">•</span>
									<span>
										{currentTime.toLocaleTimeString('id-ID', {
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit'
										})}
									</span>
								</div>
							</div>
							<div className="col-md-4 text-center">
								<div className="unila-user-avatar">
									<i className={getRoleIcon(dashboardData.role)}></i>
								</div>
							</div>
						</div>
					</div>

					{/* Dashboard Header */}
					<div className="unila-dashboard-header">
						<h2 className="unila-dashboard-title">
							<i className="fas fa-tachometer-alt"></i>
							Dashboard {getRoleDisplayName(dashboardData.role)}
						</h2>
						<div className="unila-role-badge">
							<i className="fas fa-user-tag"></i>
							Akses: {getRoleDisplayName(dashboardData.role)}
						</div>
					</div>

					{/* Role-based Dashboard Components */}
					<div className="row">
						<div className="col-12">
							{dashboardData.role === 'mahasiswa' && (
								<DashboardMahasiswa 
									data={dashboardData} 
									onDaftarSeminar={handleDaftarSeminar} 
									onDetailPendaftaran={handleDetailPendaftaran} 
								/>
							)}

							{dashboardData.role === 'dosen' && (
								<DashboardDosen 
									data={dashboardData} 
									onReviewPendaftaran={handleReviewPendaftaran} 
								/>
							)}

							{dashboardData.role === 'admin' && (
								<DashboardAdmin data={dashboardData} />
							)}
						</div>
					</div>

					{/* Footer */}
					<footer className="unila-footer">
						<div className="container">
							<div className="row">
								<div className="col-md-5 mb-4 mb-md-0">
									<h5>
										<i className="fas fa-university"></i>
										Universitas Lampung
									</h5>
									<p>
										Kampus Terpadu Universitas Lampung<br />
										Jl. Prof. Dr. Soemantri Brojonegoro No. 1<br />
										Bandar Lampung 35145, Indonesia
									</p>
									<div className="mt-3">
										<small>
											<i className="fas fa-certificate me-2"></i>
											Terakreditasi A - BAN-PT
										</small>
									</div>
								</div>
								<div className="col-md-4 mb-4 mb-md-0">
									<h5>
										<i className="fas fa-phone-alt"></i>
										Kontak
									</h5>
									<p>
										<i className="fas fa-phone me-2"></i>
										(0721) 704947<br />
										<i className="fas fa-envelope me-2"></i>
										seminar.ti@ft.unila.ac.id<br />
										<i className="fas fa-globe me-2"></i>
										www.ft.unila.ac.id
									</p>
								</div>
								<div className="col-md-3">
									<h5>
										<i className="fas fa-link"></i>
										Tautan Cepat
									</h5>
									<p>
										<a href="https://unila.ac.id" target="_blank" rel="noopener noreferrer">
											<i className="fas fa-external-link-alt me-2"></i>
											Website UNILA
										</a><br />
										<a href="https://elearning.unila.ac.id" target="_blank" rel="noopener noreferrer">
											<i className="fas fa-book me-2"></i>
											E-Learning
										</a><br />
										<a href="https://siamik.unila.ac.id" target="_blank" rel="noopener noreferrer">
											<i className="fas fa-graduation-cap me-2"></i>
											SIAK-NG
										</a>
									</p>
								</div>
							</div>
							<hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
							<div className="text-center">
								<small>
									&copy; {new Date().getFullYear()} Sistem Seminar TI - Fakultas Teknik Universitas Lampung. 
									<span className="ms-2">All rights reserved.</span>
								</small>
							</div>
						</div>
					</footer>
				</div>
			</div>

			{/* Bootstrap & Font Awesome */}
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
			<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
		</div>
	);
}

export default Dashboard;