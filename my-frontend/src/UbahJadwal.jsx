import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ubahJadwalSchema } from './validations/ubahJadwalSchema';
import { seminarAPI } from './api/endpoints/seminar';
import { useToast } from './hooks/useToast';
import ErrorAlert from './components/ErrorAlert';
import ValidationErrorAlert from './components/ValidationErrorAlert';

function UbahJadwal() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const [generalError, setGeneralError] = useState(null);
	const [validationErrors, setValidationErrors] = useState(null);
	const [seminarData, setSeminarData] = useState(null);
	const [isLoadingData, setIsLoadingData] = useState(true);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(ubahJadwalSchema),
		defaultValues: {
			tanggal_seminar: '',
			jam_mulai: '',
			ruang_seminar: '',
		},
		mode: 'onChange',
	});

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

	const pilihanJam = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

	// Load data seminar
	useEffect(() => {
		const loadSeminarData = async () => {
			try {
				setIsLoadingData(true);
				const response = await seminarAPI.getSeminarDetail(id);

				if (response.success) {
					const data = response.seminar;
					setSeminarData(data);

					// Set form values
					setValue('tanggal_seminar', data?.tanggal_seminar ? new Date(data.tanggal_seminar).toISOString().split('T')[0] : '');
					setValue('jam_mulai', data?.jam_mulai ?? '');
					setValue('ruang_seminar', data?.ruang_seminar ?? '');
				}
			} catch (err) {
				console.error('Error loading seminar data:', err);
				showError('Gagal memuat data seminar');
				setTimeout(() => {
					navigate('/dashboard');
				}, 2000);
			} finally {
				setIsLoadingData(false);
			}
		};

		if (id) {
			loadSeminarData();
		}
	}, [id]);

	const onSubmit = async (data) => {
		try {
			setGeneralError(null);
			setValidationErrors(null);

			const response = await seminarAPI.updateJadwalSeminar(id, data);

			if (response.success) {
				showSuccess('Jadwal seminar berhasil diubah!');
				setTimeout(() => {
					navigate('/dashboard');
				}, 2000);
			}
		} catch (err) {
			console.error('Error updating jadwal:', err);

			if (err.response?.status === 422) {
				setValidationErrors(err.response.data.errors);
			} else if (err.response?.status === 400) {
				setGeneralError(err.response.data.message || 'Gagal mengubah jadwal seminar');
			} else if (err.response?.status === 401) {
				showError('Sesi Anda telah berakhir. Silakan login kembali.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else {
				setGeneralError(err.response?.data?.message || 'Gagal mengubah jadwal seminar. Silakan coba lagi.');
			}
		}
	};

	const handleBackToDashboard = () => {
		navigate('/dashboard');
	};

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
					<p className="mt-4 text-primary fw-bold">Memuat Data Seminar...</p>
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
						--unila-danger: #DC3545;
						--unila-light: #F8F9FA;
						--unila-dark: #212529;
						--unila-gradient-primary: linear-gradient(135deg, #00509E 0%, #003A75 100%);
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
						background: rgba(255, 184, 28, 0.9);
						color: var(--unila-primary-dark) !important;
						border-radius: 25px;
						padding: 0.5rem 1.5rem !important;
						font-weight: 600;
						transition: all 0.3s ease;
						border: none;
					}

					.unila-back-btn:hover {
						background: white;
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(255, 184, 28, 0.3);
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

					.unila-card-body {
						padding: 2.5rem;
						background: white;
					}

					/* Info Card */
					.info-card {
						background: linear-gradient(135deg, rgba(77, 130, 188, 0.08) 0%, rgba(0, 80, 158, 0.04) 100%);
						border: 1px solid rgba(77, 130, 188, 0.2);
						border-left: 4px solid var(--unila-primary);
						border-radius: 12px;
						padding: 1.5rem;
						margin-bottom: 2rem;
					}

					.info-card-title {
						color: var(--unila-primary);
						font-weight: 700;
						font-size: 1rem;
						margin-bottom: 1rem;
						display: flex;
						align-items: center;
					}

					.info-card-title i {
						color: var(--unila-secondary);
						margin-right: 0.5rem;
					}

					.info-row {
						display: flex;
						padding: 0.5rem 0;
						border-bottom: 1px solid rgba(0, 80, 158, 0.1);
					}

					.info-row:last-child {
						border-bottom: none;
					}

					.info-label {
						font-weight: 600;
						color: var(--unila-primary);
						min-width: 150px;
					}

					.info-value {
						color: var(--unila-dark);
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

					/* Buttons */
					.unila-btn-primary {
						background: linear-gradient(135deg, var(--unila-primary) 0%, var(--unila-primary-dark) 100%);
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
						background: linear-gradient(135deg, var(--unila-primary) 0%, var(--unila-primary-dark) 100%);
						color: white;
						transform: translateY(-2px);
						border-color: var(--unila-primary);
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

					/* Alert Info */
					.unila-alert-info {
						background: linear-gradient(135deg, rgba(77, 130, 188, 0.08) 0%, rgba(0, 80, 158, 0.04) 100%);
						border: 1px solid rgba(77, 130, 188, 0.2);
						border-left: 4px solid var(--unila-primary);
						border-radius: 12px;
						color: var(--unila-primary);
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

						.info-label {
							min-width: 120px;
							font-size: 0.9rem;
						}

						.info-value {
							font-size: 0.9rem;
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
						<i className="fas fa-graduation-cap me-2"></i>
						SEMINAR TI - Ubah Jadwal Seminar
					</Link>
					<button className="btn unila-back-btn" onClick={handleBackToDashboard}>
						<i className="fas fa-arrow-left me-2"></i>
						Kembali ke Dashboard
					</button>
				</div>
			</nav>

			{/* Main Content */}
			<div className="unila-container">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-lg-10 col-xl-8">
							<div className="unila-card mb-5">
								<div className="unila-card-header">
									<h4 className="mb-0">
										<i className="fas fa-calendar-alt me-3"></i>
										Form Ubah Jadwal Seminar
									</h4>
									<p className="mb-0 mt-2 opacity-75" style={{ fontSize: '0.95rem' }}>
										Ubah tanggal, jam, dan ruang seminar Anda
									</p>
								</div>
								<div className="unila-card-body">
									{/* Informasi Seminar */}
									{seminarData && (
										<div className="info-card">
											<div className="info-card-title">
												<i className="fas fa-info-circle fa-lg"></i>
												Informasi Seminar
											</div>
											<div className="info-row">
												<div className="info-label">Jenis Seminar:</div>
												<div className="info-value">{seminarData.jenis_seminar_label || seminarData.jenis_seminar}</div>
											</div>
											<div className="info-row">
												<div className="info-label">Judul:</div>
												<div className="info-value">{seminarData.judul_seminar}</div>
											</div>
											<div className="info-row">
												<div className="info-label">Mahasiswa:</div>
												<div className="info-value">{seminarData.mahasiswa?.nama || '-'}</div>
											</div>
										</div>
									)}

									{/* Error Alerts */}
									{generalError && <ErrorAlert error={generalError} onClose={() => setGeneralError(null)} />}
									{validationErrors && <ValidationErrorAlert errors={validationErrors} onClose={() => setValidationErrors(null)} />}

									<form onSubmit={handleSubmit(onSubmit)}>
										{/* Tanggal Seminar */}
										<div className="form-group">
											<div className="form-label-wrapper">
												<label className="unila-form-label">
													Tanggal Seminar
													<span className="required-star">*</span>
												</label>
											</div>
											<input name="tanggal_seminar" type="date" {...register('tanggal_seminar')} className={`unila-form-control ${errors.tanggal_seminar ? 'is-invalid' : ''}`} />
											<div className="form-helper-text">
												<i className="fas fa-calendar-alt"></i>
												Pilih tanggal seminar yang baru
											</div>
											{errors.tanggal_seminar && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle"></i>
													{errors.tanggal_seminar.message}
												</div>
											)}
										</div>

										{/* Jam Mulai */}
										<div className="form-group">
											<div className="form-label-wrapper">
												<label className="unila-form-label">
													Jam Mulai
													<span className="required-star">*</span>
												</label>
											</div>
											<select name="jam_mulai" {...register('jam_mulai')} className={`unila-form-control ${errors.jam_mulai ? 'is-invalid' : ''}`}>
												<option value="">-- Pilih Jam Mulai --</option>
												{pilihanJam.map((jam) => (
													<option key={jam} value={jam}>
														{jam}
													</option>
												))}
											</select>
											<div className="form-helper-text">
												<i className="fas fa-clock"></i>
												Pilih jam mulai seminar yang baru
											</div>
											{errors.jam_mulai && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle"></i>
													{errors.jam_mulai.message}
												</div>
											)}
										</div>

										{/* Ruang Seminar */}
										<div className="form-group">
											<div className="form-label-wrapper">
												<label className="unila-form-label">
													Ruang Seminar
													<span className="required-star">*</span>
												</label>
											</div>
											<select name="ruang_seminar" {...register('ruang_seminar')} className={`unila-form-control ${errors.ruang_seminar ? 'is-invalid' : ''}`}>
												<option value="">-- Pilih Ruang Seminar --</option>
												{pilihanRuang.map((ruang) => (
													<option key={ruang} value={ruang}>
														{ruang}
													</option>
												))}
											</select>
											<div className="form-helper-text">
												<i className="fas fa-door-open"></i>
												Pilih ruangan yang tersedia untuk seminar Anda
											</div>
											{errors.ruang_seminar && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle"></i>
													{errors.ruang_seminar.message}
												</div>
											)}
										</div>

										<hr className="section-divider" />

										{/* Info Tambahan */}
										<div className="unila-alert-info p-4 mb-4">
											<h6 className="alert-heading d-flex align-items-center mb-3">
												<i className="fas fa-info-circle fa-lg me-3" style={{ color: 'var(--unila-primary)' }}></i>
												Informasi Penting
											</h6>
											<ul className="mb-0 small ps-3">
												<li className="mb-2">
													<i className="fas fa-check-circle me-2" style={{ color: 'var(--unila-accent)' }}></i>
													Pastikan jadwal baru tidak bentrok dengan seminar lain
												</li>
												<li className="mb-2">
													<i className="fas fa-calendar-check me-2" style={{ color: 'var(--unila-accent)' }}></i>
													Tanggal seminar harus minimal hari ini atau setelahnya
												</li>
												<li className="mb-2">
													<i className="fas fa-bell me-2" style={{ color: 'var(--unila-secondary)' }}></i>
													Pembimbing dan penguji akan menerima notifikasi perubahan jadwal
												</li>
												<li>
													<i className="fas fa-user-check me-2" style={{ color: 'var(--unila-primary)' }}></i>
													Perubahan jadwal akan direview oleh admin
												</li>
											</ul>
										</div>

										{/* Buttons */}
										<div className="d-flex justify-content-between mt-5 buttons-wrapper">
											<button type="button" className="btn unila-btn-secondary" onClick={handleBackToDashboard} disabled={isSubmitting}>
												<i className="fas fa-times me-2"></i>
												Batal
											</button>
											<button type="submit" className="btn unila-btn-primary" disabled={isSubmitting}>
												{isSubmitting ? (
													<>
														<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
														Menyimpan Perubahan...
													</>
												) : (
													<>
														<i className="fas fa-save me-2"></i>
														Simpan Perubahan Jadwal
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

export default UbahJadwal;
