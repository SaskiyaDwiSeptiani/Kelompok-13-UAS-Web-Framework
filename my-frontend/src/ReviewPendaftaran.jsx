import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { seminarAPI } from './api/endpoints/seminar';
import { useToast } from './hooks/useToast';
import ErrorAlert from './components/ErrorAlert';
import ValidationErrorAlert from './components/ValidationErrorAlert';

function ReviewPendaftaran() {
	const navigate = useNavigate();
	const { id } = useParams();
	const { showSuccess, showError } = useToast();

	const [seminarData, setSeminarData] = useState(null);
	const [existingReview, setExistingReview] = useState(null);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [generalError, setGeneralError] = useState(null);
	const [validationErrors, setValidationErrors] = useState(null);
	const [isJadwalAlternatif, setIsJadwalAlternatif] = useState(false);
	const [errorNotFound, setErrorNotFound] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isUpdateMode = !!existingReview;

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: {
			status: 'direview',
			catatan: '',
			jadwal_alternatif: false,
			tanggal_alternatif: '',
			jam_alternatif: '',
			ruang_alternatif: '',
		},
		mode: 'onChange',
	});

	const jadwalAlternatifWatch = watch('jadwal_alternatif');

	// Pilihan jam
	const pilihanJam = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

	// Pilihan ruang
	const pilihanRuang = [
		'Ruang Seminar TI Gedung A - Lantai 1',
		'Ruang Seminar TI Gedung B - Lantai 2',
		'Ruang Seminar TI Gedung C - Lantai 3',
		'Auditorium Jurusan Teknik Informatika',
		'Laboratorium Komputer 1 - Gedung TI',
		'Laboratorium Komputer 2 - Gedung TI',
		'Ruang Rapat Fakultas - Gedung Rektorat',
		'Studio Multimedia - Gedung Creative Center',
	];

	const statusOptions = [
		{ value: 'direview', label: 'Sedang Direview' },
		{ value: 'disetujui', label: 'Disetujui' },
		{ value: 'ditolak', label: 'Ditolak' },
		{ value: 'revisi', label: 'Perlu Revisi' },
	];

	useEffect(() => {
		loadSeminarDetail();
	}, [id]);

	useEffect(() => {
		if (jadwalAlternatifWatch) {
			setIsJadwalAlternatif(true);
		} else {
			setIsJadwalAlternatif(false);
		}
	}, [jadwalAlternatifWatch]);

	const loadSeminarDetail = async () => {
		try {
			setIsLoadingData(true);
			setErrorNotFound(false);
			setGeneralError(null);

			// Validasi ID
			if (!id || isNaN(parseInt(id))) {
				throw new Error('ID seminar tidak valid');
			}

			const response = await seminarAPI.getSeminarDetail(id);

			if (response.success) {
				setSeminarData(response.seminar);

				// Check if current user already has a review
				const userData = JSON.parse(localStorage.getItem('user') || '{}');
				const userReview = response.seminar.reviews?.find((r) => r.dosen?.id === userData.id);

				if (userReview) {
					setExistingReview(userReview);
					// Populate form with existing review data
					setValue('status', userReview.status);
					setValue('catatan', userReview.catatan || '');

					// Populate jadwal alternatif jika ada
					if (userReview.jadwal_alternatif) {
						setValue('jadwal_alternatif', true);
						setValue('tanggal_alternatif', userReview.tanggal_alternatif?.split('T')[0] || '');
						setValue('jam_alternatif', userReview.jam_alternatif || '');
						setValue('ruang_alternatif', userReview.ruang_alternatif || '');
					}
				}
			} else {
				throw new Error(response.message || 'Gagal memuat data seminar');
			}
		} catch (err) {
			console.error('Error loading seminar:', err);

			// Cek jenis error
			if (err.response?.status === 404 || err.response?.data?.message?.includes('No query results')) {
				setErrorNotFound(true);
				setGeneralError('Data seminar tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.');
			} else if (err.response?.status === 401) {
				showError('Sesi Anda telah berakhir. Silakan login kembali.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else if (err.response?.status === 403) {
				setGeneralError('Anda tidak memiliki akses untuk melihat seminar ini');
			} else {
				setGeneralError(err.response?.data?.message || err.message || 'Gagal memuat data seminar. Silakan coba lagi.');
			}
		} finally {
			setIsLoadingData(false);
		}
	};

	const onSubmit = async (data) => {
		console.log('Form submitted with data:', data);

		try {
			setIsSubmitting(true);
			setGeneralError(null);
			setValidationErrors(null);

			// Get current user data
			const userData = JSON.parse(localStorage.getItem('user') || '{}');
			if (!userData.id) {
				throw new Error('Data pengguna tidak valid. Silakan login ulang.');
			}

			// Tentukan peran berdasarkan posisi dosen di seminar
			let peran = 'reviewer_lain';
			if (seminarData.pembimbing_1_id === userData.id) {
				peran = 'pembimbing_1';
			} else if (seminarData.pembimbing_2_id === userData.id) {
				peran = 'pembimbing_2';
			} else if (seminarData.penguji_1_id === userData.id) {
				peran = 'penguji_1';
			} else if (seminarData.penguji_2_id === userData.id) {
				peran = 'penguji_2';
			}

			const requestData = {
				seminar_id: parseInt(id),
				dosen_id: userData.id,
				peran: peran,
				status: data.status,
				catatan: data.catatan || '',
			};

			// Tambahkan data jadwal alternatif jika dipilih
			if (data.jadwal_alternatif && data.tanggal_alternatif && data.jam_alternatif && data.ruang_alternatif) {
				requestData.jadwal_alternatif = true;
				requestData.tanggal_alternatif = data.tanggal_alternatif;
				requestData.jam_alternatif = data.jam_alternatif;
				requestData.ruang_alternatif = data.ruang_alternatif;
			} else {
				requestData.jadwal_alternatif = false;
				requestData.tanggal_alternatif = null;
				requestData.jam_alternatif = null;
				requestData.ruang_alternatif = null;
			}

			console.log('Sending request data:', requestData);

			let response;
			if (isUpdateMode) {
				// Update review yang sudah ada
				response = await seminarAPI.updateReview(existingReview.id, requestData);
			} else {
				// Buat review baru
				response = await seminarAPI.createReview(requestData);
			}

			console.log('API Response:', response);

			if (response.success) {
				showSuccess(isUpdateMode ? 'Review berhasil diperbarui!' : 'Review berhasil dibuat!');

				// Redirect ke dashboard setelah 1.5 detik
				setTimeout(() => {
					navigate('/dashboard');
				}, 1500);
			} else {
				throw new Error(response.message || 'Gagal menyimpan review');
			}
		} catch (err) {
			console.error('Error submitting review:', err);
			console.error('Error details:', {
				status: err.response?.status,
				data: err.response?.data,
				message: err.message,
			});

			if (err.response?.status === 422) {
				setValidationErrors(err.response.data.errors || { message: err.response.data.message });
			} else if (err.response?.status === 403) {
				setGeneralError('Anda tidak memiliki akses untuk melakukan aksi ini');
			} else if (err.response?.status === 401) {
				showError('Sesi Anda telah berakhir. Silakan login kembali.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else if (err.response?.status === 404) {
				setGeneralError('Data seminar tidak ditemukan. Mungkin sudah dihapus.');
			} else {
				setGeneralError(err.response?.data?.message || err.message || 'Gagal menyimpan review. Silakan coba lagi.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => {
		navigate('/dashboard');
	};

	const formatDate = (dateString) => {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			});
		} catch (error) {
			return '-';
		}
	};

	// Render loading
	if (isLoadingData) {
		return (
			<div className="unila-loading d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)' }}>
				<div className="text-center">
					<div className="position-relative">
						<div className="unila-spinner spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="position-absolute top-50 start-50 translate-middle" style={{ width: '2.5rem', height: '2.5rem' }}>
							<div className="spinner-grow text-warning" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					</div>
					<p className="mt-4 text-primary fw-bold">Memuat Data Review...</p>
				</div>
			</div>
		);
	}

	// Render error jika seminar tidak ditemukan
	if (errorNotFound || !seminarData) {
		return (
			<div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
				<nav className="navbar navbar-expand-lg unila-navbar">
					<div className="container">
						<Link className="navbar-brand unila-navbar-brand" to="/dashboard">
							<i className="fas fa-graduation-cap me-2"></i>
							SEMINAR TI - Review Pendaftaran
						</Link>
						<button className="btn unila-back-btn" onClick={handleBack}>
							<i className="fas fa-arrow-left me-2"></i>
							Kembali ke Dashboard
						</button>
					</div>
				</nav>
				<div className="unila-container">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-lg-6">
								<div className="unila-card mt-4">
									<div className="unila-card-header unila-card-header-danger">
										<h5 className="mb-0">
											<i className="fas fa-exclamation-triangle me-2"></i>
											Data Tidak Ditemukan
										</h5>
									</div>
									<div className="unila-card-body text-center">
										<i className="fas fa-search fa-4x text-muted mb-4"></i>
										<h4 className="mb-3">Seminar Tidak Ditemukan</h4>
										<p className="text-muted mb-4">Data seminar dengan ID #{id} tidak ditemukan dalam sistem. Mungkin data telah dihapus atau ID yang dimasukkan tidak valid.</p>
										<div className="d-flex justify-content-center gap-3">
											<button className="btn unila-btn-primary" onClick={handleBack}>
												<i className="fas fa-arrow-left me-2"></i>
												Kembali ke Dashboard
											</button>
											<button className="btn unila-btn-secondary" onClick={() => navigate(-1)}>
												<i className="fas fa-history me-2"></i>
												Kembali ke Halaman Sebelumnya
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="unila-dashboard" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<style>
				{`
					/* UNILA Color Palette */
					:root {
						--unila-primary: #00509E;
						--unila-primary-dark: #003A75;
						--unila-primary-light: #4D82BC;
						--unila-secondary: #FFB81C;
						--unila-accent: #28A745;
						--unila-warning: #FFC107;
						--unila-danger: #DC3545;
						--unila-info: #17A2B8;
						--unila-light: #F8F9FA;
						--unila-dark: #212529;
						--unila-gradient-primary: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						--unila-gradient-secondary: linear-gradient(135deg, #FFB81C 0%, #E0A800 100%);
						--unila-gradient-success: linear-gradient(135deg, #28A745 0%, #1E7E34 100%);
					}

					/* Navigation Bar */
					.unila-navbar {
						background: var(--unila-gradient-primary);
						box-shadow: 0 2px 15px rgba(0, 80, 158, 0.2);
						padding: 1rem 0;
						border-bottom: 4px solid var(--unila-secondary);
						position: sticky;
						top: 0;
						z-index: 1000;
					}

					.unila-navbar-brand {
						font-weight: 700;
						font-size: 1.4rem;
						color: white !important;
						text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
					}

					.unila-navbar-brand i {
						color: var(--unila-secondary);
					}

					.unila-back-btn {
						background: var(--unila-gradient-secondary);
						color: var(--unila-primary-dark) !important;
						border-radius: 25px;
						padding: 0.5rem 1.5rem !important;
						font-weight: 600;
						transition: all 0.3s ease;
						border: none;
						box-shadow: 0 4px 12px rgba(255, 184, 28, 0.2);
					}

					.unila-back-btn:hover {
						background: white;
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(255, 184, 28, 0.3);
						color: var(--unila-primary-dark) !important;
					}

					/* Main Container */
					.unila-container {
						background: linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%);
						padding: 2rem 0;
						min-height: calc(100vh - 76px);
					}

					/* Card Styles */
					.unila-card {
						border: none;
						border-radius: 20px;
						box-shadow: 0 15px 40px rgba(0, 80, 158, 0.12);
						transition: transform 0.3s ease;
						overflow: hidden;
					}

					.unila-card:hover {
						transform: translateY(-5px);
						box-shadow: 0 20px 50px rgba(0, 80, 158, 0.18);
					}

					.unila-card-header {
						background: linear-gradient(135deg, var(--unila-primary) 0%, var(--unila-primary-light) 100%);
						color: white;
						padding: 1.5rem 2rem;
						font-weight: 700;
						font-size: 1.3rem;
						border-bottom: none;
						position: relative;
						overflow: hidden;
					}

					.unila-card-header::before {
						content: '';
						position: absolute;
						top: 0;
						right: 0;
						width: 100px;
						height: 100%;
						background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1));
					}

					/* Info Card Header Variations */
					.unila-card-header-info {
						background: linear-gradient(135deg, var(--unila-info) 0%, #138496 100%);
					}

					.unila-card-header-warning {
						background: var(--unila-gradient-secondary);
						color: var(--unila-primary-dark);
					}

					.unila-card-header-danger {
						background: linear-gradient(135deg, var(--unila-danger) 0%, #c82333 100%);
						color: white;
					}

					/* Card Body */
					.unila-card-body {
						padding: 2rem;
						background: white;
					}

					/* Form Elements */
					.form-group {
						margin-bottom: 1.75rem;
					}

					.form-label-wrapper {
						display: flex;
						align-items: center;
						margin-bottom: 0.75rem;
					}

					.unila-form-label {
						font-weight: 600;
						color: var(--unila-primary);
						margin-bottom: 0;
						font-size: 0.95rem;
						display: flex;
						align-items: center;
					}

					.required-star {
						color: var(--unila-danger);
						font-size: 1.2rem;
						margin-left: 4px;
						font-weight: bold;
						line-height: 1;
					}

					.unila-form-control {
						border: 2px solid #e9ecef;
						border-radius: 12px;
						padding: 0.85rem 1.25rem;
						transition: all 0.3s ease;
						font-size: 0.95rem;
						background-color: #fff;
						width: 100%;
					}

					.unila-form-control:focus {
						border-color: var(--unila-primary);
						box-shadow: 0 0 0 0.25rem rgba(0, 80, 158, 0.15);
						background-color: #fff;
					}

					.unila-form-control.is-invalid {
						border-color: var(--unila-danger);
						background-image: none;
					}

					/* Form Helper Text */
					.form-helper-text {
						font-size: 0.85rem;
						color: #6c757d;
						margin-top: 0.5rem;
						display: flex;
						align-items: center;
						gap: 5px;
					}

					.form-helper-text i {
						color: var(--unila-primary-light);
					}

					/* Checkbox Custom */
					.custom-checkbox {
						display: flex;
						align-items: center;
						gap: 10px;
						cursor: pointer;
						margin-bottom: 1.5rem;
						padding: 0.75rem 1rem;
						background: linear-gradient(135deg, rgba(255, 184, 28, 0.1) 0%, rgba(255, 184, 28, 0.05) 100%);
						border-radius: 12px;
						border: 2px solid transparent;
						transition: all 0.3s ease;
					}

					.custom-checkbox:hover {
						border-color: var(--unila-secondary);
						background: linear-gradient(135deg, rgba(255, 184, 28, 0.15) 0%, rgba(255, 184, 28, 0.08) 100%);
					}

					.custom-checkbox input[type="checkbox"] {
						width: 20px;
						height: 20px;
						border-radius: 6px;
						border: 2px solid var(--unila-primary);
						cursor: pointer;
						accent-color: var(--unila-primary);
					}

					.custom-checkbox label {
						font-weight: 600;
						color: var(--unila-primary);
						cursor: pointer;
						margin-bottom: 0;
					}

					/* Jadwal Alternatif Form */
					.jadwal-alternatif-form {
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.05) 0%, rgba(0, 58, 117, 0.02) 100%);
						border-radius: 12px;
						padding: 1.5rem;
						border: 2px solid var(--unila-primary-light);
						margin-top: 1rem;
						animation: slideDown 0.3s ease-out;
					}

					@keyframes slideDown {
						from {
							opacity: 0;
							transform: translateY(-10px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}

					/* Info Items */
					.unila-info-item {
						margin-bottom: 1.5rem;
						padding-bottom: 1.5rem;
						border-bottom: 1px solid rgba(0, 0, 0, 0.05);
					}

					.unila-info-label {
						font-size: 0.85rem;
						color: var(--unila-primary);
						font-weight: 600;
						margin-bottom: 0.5rem;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}

					.unila-info-value {
						font-size: 1rem;
						color: var(--unila-dark);
						font-weight: 500;
					}

					/* Alerts */
					.unila-alert-info {
						background: linear-gradient(135deg, rgba(77, 130, 188, 0.08) 0%, rgba(0, 80, 158, 0.04) 100%);
						border: 1px solid rgba(77, 130, 188, 0.2);
						border-left: 4px solid var(--unila-primary);
						border-radius: 12px;
						color: var(--unila-primary);
					}

					.unila-alert-warning {
						background: linear-gradient(135deg, rgba(255, 184, 28, 0.08) 0%, rgba(255, 184, 28, 0.04) 100%);
						border: 1px solid rgba(255, 184, 28, 0.2);
						border-left: 4px solid var(--unila-secondary);
						border-radius: 12px;
						color: var(--unila-primary-dark);
					}

					.unila-alert-success {
						background: linear-gradient(135deg, rgba(40, 167, 69, 0.08) 0%, rgba(30, 126, 52, 0.04) 100%);
						border: 1px solid rgba(40, 167, 69, 0.2);
						border-left: 4px solid var(--unila-accent);
						border-radius: 12px;
						color: var(--unila-primary);
					}

					.unila-error-alert {
						border-radius: 12px;
						border: 1px solid rgba(220, 53, 69, 0.2);
						background: linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(200, 35, 51, 0.02) 100%);
						border-left: 4px solid var(--unila-danger);
					}

					/* Badges */
					.unila-badge {
						padding: 0.5em 1em;
						border-radius: 20px;
						font-weight: 600;
						font-size: 0.85rem;
					}

					.unila-badge-success {
						background: var(--unila-gradient-success);
						color: white;
					}

					.unila-badge-warning {
						background: var(--unila-gradient-secondary);
						color: var(--unila-primary-dark);
					}

					.unila-badge-danger {
						background: linear-gradient(135deg, var(--unila-danger) 0%, #c82333 100%);
						color: white;
					}

					.unila-badge-info {
						background: linear-gradient(135deg, var(--unila-info) 0%, #138496 100%);
						color: white;
					}

					/* Buttons */
					.unila-btn-primary {
						background: var(--unila-gradient-primary);
						border: none;
						color: white;
						padding: 0.85rem 2.5rem;
						border-radius: 12px;
						font-weight: 600;
						transition: all 0.3s ease;
						box-shadow: 0 4px 15px rgba(0, 80, 158, 0.2);
						font-size: 1rem;
					}

					.unila-btn-primary:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(0, 80, 158, 0.3);
						color: white;
					}

					.unila-btn-primary:disabled {
						opacity: 0.7;
						transform: none;
						box-shadow: none;
						cursor: not-allowed;
					}

					.unila-btn-secondary {
						background: white;
						border: 2px solid var(--unila-primary);
						color: var(--unila-primary);
						padding: 0.85rem 2.5rem;
						border-radius: 12px;
						font-weight: 600;
						transition: all 0.3s ease;
						font-size: 1rem;
					}

					.unila-btn-secondary:hover {
						background: var(--unila-gradient-primary);
						color: white;
						transform: translateY(-2px);
						border-color: var(--unila-primary);
					}

					.unila-btn-warning {
						background: var(--unila-gradient-secondary);
						border: none;
						color: var(--unila-primary-dark);
						padding: 0.85rem 2rem;
						border-radius: 12px;
						font-weight: 600;
						transition: all 0.3s ease;
					}

					.unila-btn-warning:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 15px rgba(255, 184, 28, 0.2);
						color: var(--unila-primary-dark);
					}

					/* Loading Spinner */
					.unila-spinner {
						border-width: 0.3em;
						border-top-color: var(--unila-primary);
						border-right-color: rgba(0, 80, 158, 0.2);
						border-bottom-color: rgba(0, 80, 158, 0.2);
						border-left-color: rgba(0, 80, 158, 0.2);
					}

					/* Error Messages */
					.error-message {
						display: flex;
						align-items: center;
						gap: 6px;
						color: var(--unila-danger);
						font-size: 0.875rem;
						margin-top: 0.5rem;
						background: rgba(220, 53, 69, 0.05);
						padding: 0.5rem 0.75rem;
						border-radius: 8px;
						border-left: 3px solid var(--unila-danger);
					}

					.error-message i {
						font-size: 0.9rem;
					}

					/* Section Divider */
					.section-divider {
						border: none;
						height: 1px;
						background: linear-gradient(90deg, transparent, var(--unila-primary-light), transparent);
						margin: 2.5rem 0;
					}

					/* Responsive */
					@media (max-width: 768px) {
						.unila-card-body {
							padding: 1.5rem;
						}
						
						.unila-card-header {
							padding: 1.2rem 1.5rem;
							font-size: 1.1rem;
						}

						.unila-btn-primary,
						.unila-btn-secondary {
							padding: 0.75rem 1.5rem;
							width: 100%;
							margin-bottom: 0.5rem;
						}
						
						.buttons-wrapper {
							flex-direction: column;
						}
					}

					/* Animations */
					@keyframes fadeIn {
						from {
							opacity: 0;
							transform: translateY(10px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}

					.form-group {
						animation: fadeIn 0.3s ease-out forwards;
					}
				`}
			</style>

			{/* Navbar */}
			<nav className="navbar navbar-expand-lg unila-navbar">
				<div className="container">
					<Link className="navbar-brand unila-navbar-brand" to="/dashboard">
						<i className="fas fa-clipboard-check me-2"></i>
						SEMINAR TI - {isUpdateMode ? 'Edit Review' : 'Buat Review'}
					</Link>
					<button className="btn unila-back-btn" onClick={handleBack}>
						<i className="fas fa-arrow-left me-2"></i>
						Kembali ke Dashboard
					</button>
				</div>
			</nav>

			{/* Main Content */}
			<div className="unila-container">
				<div className="container">
					<div className="row">
						{/* Info Seminar Sidebar */}
						<div className="col-lg-4 mb-4">
							<div className="unila-card">
								<div className="unila-card-header unila-card-header-info">
									<h5 className="mb-0">
										<i className="fas fa-info-circle me-2"></i>
										Detail Seminar
									</h5>
								</div>
								<div className="unila-card-body">
									<div className="unila-info-item">
										<div className="unila-info-label">Jenis Seminar</div>
										<div className="unila-info-value">
											<span className="badge bg-primary rounded-pill px-3 py-1">{seminarData.jenis_seminar_text}</span>
										</div>
									</div>

									<div className="unila-info-item">
										<div className="unila-info-label">Judul Seminar</div>
										<div className="unila-info-value">{seminarData.judul_seminar}</div>
									</div>

									<div className="unila-info-item">
										<div className="unila-info-label">Mahasiswa</div>
										<div className="unila-info-value">{seminarData.mahasiswa?.nama}</div>
										<div className="text-muted small mt-1">
											<i className="fas fa-id-card me-1"></i>
											{seminarData.mahasiswa?.npm}
										</div>
									</div>

									<div className="row">
										<div className="col-md-6">
											<div className="unila-info-item">
												<div className="unila-info-label">Tanggal</div>
												<div className="unila-info-value">{formatDate(seminarData.tanggal_seminar)}</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="unila-info-item">
												<div className="unila-info-label">Waktu</div>
												<div className="unila-info-value">
													{seminarData.jam_mulai} - {seminarData.jam_selesai}
												</div>
											</div>
										</div>
									</div>

									<div className="unila-info-item">
										<div className="unila-info-label">Ruang Seminar</div>
										<div className="unila-info-value">{seminarData.ruang_seminar}</div>
									</div>

									<div className="unila-info-item">
										<div className="unila-info-label">Status Seminar</div>
										<div className="unila-info-value">
											<span className={`badge bg-${seminarData.status_badge} rounded-pill px-3 py-1`}>{seminarData.status_text}</span>
										</div>
									</div>

									{/* File Proposal */}
									{seminarData.file_proposal && (
										<div className="mt-4">
											<button className="btn unila-btn-warning w-100" onClick={() => window.open(`http://localhost:8000/storage/proposals/${seminarData.file_proposal}`, '_blank')}>
												<i className="fas fa-download me-2"></i>
												Download Proposal
											</button>
										</div>
									)}
								</div>
							</div>

							{/* Existing Review Info */}
							{isUpdateMode && (
								<div className="unila-card mt-3">
									<div className="unila-card-header unila-card-header-warning">
										<h6 className="mb-0">
											<i className="fas fa-edit me-2"></i>
											Mode Edit Review
										</h6>
									</div>
									<div className="unila-card-body">
										<div className="unila-info-item">
											<div className="unila-info-label">Peran</div>
											<div className="unila-info-value text-capitalize">
												{existingReview.peran
													?.replace('pembimbing_1', 'Pembimbing 1')
													.replace('pembimbing_2', 'Pembimbing 2')
													.replace('penguji_1', 'Penguji 1')
													.replace('penguji_2', 'Penguji 2')
													.replace('_', ' ') || '-'}
											</div>
										</div>
										<div className="unila-info-item">
											<div className="unila-info-label">Tanggal Review Awal</div>
											<div className="unila-info-value">{formatDate(existingReview.created_at)}</div>
										</div>
										<div className="alert unila-alert-info mt-3 mb-0">
											<i className="fas fa-lightbulb me-2"></i>
											Anda dapat mengupdate review yang sudah ada
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Form Review */}
						<div className="col-lg-8">
							<div className="unila-card">
								<div className="unila-card-header">
									<h4 className="mb-0">
										<i className="fas fa-clipboard-check me-2"></i>
										{isUpdateMode ? 'Edit Review Seminar' : 'Form Review Seminar'}
									</h4>
									<p className="mb-0 mt-2 opacity-75" style={{ fontSize: '0.95rem' }}>
										Berikan penilaian dan masukan untuk pengajuan seminar ini
									</p>
								</div>
								<div className="unila-card-body p-4">
									{generalError && <ErrorAlert error={generalError} onClose={() => setGeneralError(null)} />}
									{validationErrors && <ValidationErrorAlert errors={validationErrors} onClose={() => setValidationErrors(null)} />}

									<form onSubmit={handleSubmit(onSubmit)}>
										{/* Status */}
										<div className="form-group">
											<div className="form-label-wrapper">
												<label className="unila-form-label">
													Status Review
													<span className="required-star">*</span>
												</label>
											</div>
											<select name="status" {...register('status')} className={`unila-form-control ${errors.status ? 'is-invalid' : ''}`}>
												{statusOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
											<div className="form-helper-text">
												<i className="fas fa-info-circle"></i>
												Pilih status review untuk pengajuan seminar ini
											</div>
											{errors.status && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle"></i>
													{errors.status.message}
												</div>
											)}
										</div>

										{/* Catatan */}
										<div className="form-group">
											<div className="form-label-wrapper">
												<label className="unila-form-label">Catatan Review</label>
											</div>
											<textarea
												name="catatan"
												{...register('catatan')}
												placeholder="Berikan catatan atau komentar untuk mahasiswa..."
												rows={5}
												className={`unila-form-control ${errors.catatan ? 'is-invalid' : ''}`}
											/>
											<div className="form-helper-text">
												<i className="fas fa-comment-dots"></i>
												Catatan akan dilihat oleh mahasiswa dan admin
											</div>
											{errors.catatan && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle"></i>
													{errors.catatan.message}
												</div>
											)}
										</div>

										<hr className="section-divider" />

										{/* Jadwal Alternatif */}
										<div className="unila-card bg-light">
											<div className="unila-card-header bg-light">
												<h6 className="mb-0 text-primary">
													<i className="fas fa-calendar-alt me-2"></i>
													Pilihan Jadwal Alternatif
												</h6>
												<small className="text-muted">Centang jika Anda tidak bisa hadir pada jadwal yang diusulkan</small>
											</div>
											<div className="unila-card-body">
												<div className="custom-checkbox">
													<input type="checkbox" id="jadwal_alternatif" {...register('jadwal_alternatif')} />
													<label htmlFor="jadwal_alternatif">
														<i className="fas fa-calendar-times me-2 text-warning"></i>
														Saya tidak bisa hadir pada jadwal yang diusulkan
													</label>
												</div>

												{isJadwalAlternatif && (
													<div className="jadwal-alternatif-form">
														<div className="row">
															<div className="col-md-6 mb-3">
																<label className="unila-form-label mb-2">
																	Tanggal Alternatif
																	<span className="required-star">*</span>
																</label>
																<input type="date" {...register('tanggal_alternatif')} className={`unila-form-control ${errors.tanggal_alternatif ? 'is-invalid' : ''}`} />
																{errors.tanggal_alternatif && (
																	<div className="error-message">
																		<i className="fas fa-exclamation-circle"></i>
																		{errors.tanggal_alternatif.message}
																	</div>
																)}
															</div>
															<div className="col-md-6 mb-3">
																<label className="unila-form-label mb-2">
																	Jam Alternatif
																	<span className="required-star">*</span>
																</label>
																<select {...register('jam_alternatif')} className={`unila-form-control ${errors.jam_alternatif ? 'is-invalid' : ''}`}>
																	<option value="">-- Pilih Jam --</option>
																	{pilihanJam.map((jam) => (
																		<option key={jam} value={jam}>
																			{jam}
																		</option>
																	))}
																</select>
																{errors.jam_alternatif && (
																	<div className="error-message">
																		<i className="fas fa-exclamation-circle"></i>
																		{errors.jam_alternatif.message}
																	</div>
																)}
															</div>
															<div className="col-md-12 mb-3">
																<label className="unila-form-label mb-2">
																	Ruang Alternatif
																	<span className="required-star">*</span>
																</label>
																<select {...register('ruang_alternatif')} className={`unila-form-control ${errors.ruang_alternatif ? 'is-invalid' : ''}`}>
																	<option value="">-- Pilih Ruang --</option>
																	{pilihanRuang.map((ruang) => (
																		<option key={ruang} value={ruang}>
																			{ruang}
																		</option>
																	))}
																</select>
																{errors.ruang_alternatif && (
																	<div className="error-message">
																		<i className="fas fa-exclamation-circle"></i>
																		{errors.ruang_alternatif.message}
																	</div>
																)}
															</div>
														</div>
														<div className="alert unila-alert-warning mt-3 mb-0">
															<i className="fas fa-info-circle me-2"></i>
															<strong>Catatan:</strong> Jadwal alternatif ini akan dipertimbangkan oleh koordinator seminar untuk penjadwalan ulang
														</div>
													</div>
												)}
											</div>
										</div>

										<hr className="section-divider" />

										{/* Info */}
										<div className="alert unila-alert-warning mt-4">
											<h6 className="alert-heading d-flex align-items-center">
												<i className="fas fa-exclamation-triangle me-2"></i>
												Perhatian Penting
											</h6>
											<ul className="mb-0 ps-3 mt-2">
												<li className="mb-1">
													<i className="fas fa-check-circle me-2 text-success"></i>
													Pastikan Anda sudah membaca proposal mahasiswa dengan teliti
												</li>
												<li className="mb-1">
													<i className="fas fa-check-circle me-2 text-success"></i>
													Status review akan mempengaruhi status seminar di dashboard
												</li>
												<li className="mb-1">
													<i className="fas fa-check-circle me-2 text-success"></i>
													Catatan yang Anda berikan akan dilihat oleh mahasiswa
												</li>
												<li className="mb-1">
													<i className="fas fa-database me-2 text-primary"></i>
													Data review akan disimpan ke database dan dapat dilihat di semua dashboard
												</li>
												{!isUpdateMode && (
													<li className="mb-1">
														<i className="fas fa-sync-alt me-2 text-primary"></i>
														Setelah membuat review, Anda dapat mengeditnya kapan saja
													</li>
												)}
											</ul>
										</div>

										{/* Buttons */}
										<div className="d-flex justify-content-between mt-5 buttons-wrapper">
											<button type="button" className="btn unila-btn-secondary" onClick={handleBack} disabled={isSubmitting}>
												<i className="fas fa-times me-2"></i>
												Batal
											</button>
											<button type="submit" className="btn unila-btn-primary" disabled={isSubmitting}>
												{isSubmitting ? (
													<>
														<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
														Menyimpan...
													</>
												) : (
													<>
														<i className="fas fa-save me-2"></i>
														{isUpdateMode ? 'Update Review' : 'Kirim Review'}
													</>
												)}
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bootstrap & Font Awesome */}
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
			<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
		</div>
	);
}

export default ReviewPendaftaran;
