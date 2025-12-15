import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from './api/endpoints/auth';
import { registerSchema } from './validations/registerSchema';
import { useToast } from './hooks/useToast';
import ErrorAlert from './components/ErrorAlert';
import ValidationErrorAlert from './components/ValidationErrorAlert';
import FormInput from './components/FormInput';
import FormSelect from './components/FormSelect';

function Register() {
	const [apiError, setApiError] = useState('');
	const [validationErrors, setValidationErrors] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			nama: '',
			email: '',
			username: '',
			password: '',
			role: 'mahasiswa',
			npm: '',
			konsentrasi: '',
		},
		mode: 'onChange',
	});

	const handleRegister = async (data) => {
		setIsLoading(true);
		setApiError('');
		setValidationErrors(null);

		try {
			const payload = {
				nama: data.nama,
				email: data.email,
				username: data.username,
				password: data.password,
				role: 'mahasiswa',
				npm: data.npm,
				konsentrasi: data.konsentrasi,
			};

			await authAPI.register(payload);

			showSuccess('Registrasi berhasil! Silakan login.');
			reset();

			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (err) {
			console.error('Registration error:', err);

			if (err.response?.status === 422) {
				const errors = err.response?.data?.errors || err.response?.data?.message;
				setValidationErrors(errors);
				showError('Silakan periksa kembali data yang Anda inputkan');
			} else {
				const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
				setApiError(errorMessage);
				showError(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			<style>
				{`
					.unila-primary { color: #00509E; }
					.unila-primary-bg { background: #00509E; }
					.unila-gradient-bg { background: linear-gradient(135deg, #00509E 0%, #003A75 100%); }
					.unila-gradient-light { background: linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%); }
					.unila-accent { color: #FFB81C; }
					.unila-card { 
						border: none; 
						border-radius: 15px; 
						box-shadow: 0 5px 20px rgba(0, 80, 158, 0.08);
						transition: transform 0.3s ease, box-shadow 0.3s ease;
					}
					.unila-card:hover { 
						transform: translateY(-5px); 
						box-shadow: 0 10px 30px rgba(0, 80, 158, 0.15);
					}
					.unila-card-header {
						background: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						color: white;
						border-radius: 15px 15px 0 0 !important;
						padding: 1.5rem;
						border: none;
					}
					.unila-btn-primary {
						background: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						border: none;
						color: white;
						padding: 0.6rem 1.5rem;
						border-radius: 8px;
						font-weight: 500;
						transition: all 0.3s ease;
					}
					.unila-btn-primary:hover {
						transform: translateY(-2px);
						box-shadow: 0 5px 15px rgba(0, 80, 158, 0.3);
						color: white;
					}
					.unila-btn-secondary {
						background: white;
						border: 2px solid #00509E;
						color: #00509E;
						padding: 0.6rem 1.5rem;
						border-radius: 8px;
						font-weight: 500;
						transition: all 0.3s ease;
					}
					.unila-btn-secondary:hover {
						background: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						color: white;
						transform: translateY(-2px);
					}
					.info-label {
						color: #6c757d;
						font-size: 0.85rem;
						font-weight: 500;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						margin-bottom: 0.3rem;
					}
					.info-value {
						color: #00509E;
						font-weight: 600;
						font-size: 1rem;
					}
					.form-group {
						margin-bottom: 1.5rem;
					}
					.required-star {
						color: #DC3545;
						margin-left: 4px;
					}
					.error-message {
						color: #DC3545;
						font-size: 0.875rem;
						margin-top: 0.5rem;
						padding: 0.5rem;
						background: rgba(220, 53, 69, 0.05);
						border-radius: 4px;
						border-left: 3px solid #DC3545;
					}
					.alert-info-custom {
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.1) 0%, rgba(0, 58, 117, 0.05) 100%);
						border: 1px solid #4D82BC;
						border-left: 4px solid #00509E;
						border-radius: 8px;
						color: #00509E;
					}
					.alert-warning-custom {
						background: linear-gradient(135deg, rgba(255, 184, 28, 0.1) 0%, rgba(224, 168, 0, 0.05) 100%);
						border: 1px solid #FFB81C;
						border-left: 4px solid #e0a800;
						border-radius: 8px;
						color: #003A75;
					}
				`}
			</style>

			{/* Navbar */}
			<nav className="navbar navbar-expand-lg" style={{ background: 'linear-gradient(135deg, #00509E 0%, #003A75 100%)', padding: '1rem 0', boxShadow: '0 2px 15px rgba(0, 80, 158, 0.2)', borderBottom: '4px solid #FFB81C', position: 'sticky', top: 0, zIndex: 1000 }}>
				<div className="container">
					<Link className="navbar-brand text-white fw-bold" to="/" style={{ fontSize: '1.4rem' }}>
						<i className="fas fa-graduation-cap me-2" style={{ color: '#FFB81C' }}></i>
						SEMINAR TI - Registrasi
					</Link>
					<Link className="btn" to="/login" style={{ background: 'rgba(255, 184, 28, 0.9)', color: '#003A75', borderRadius: '25px', padding: '0.5rem 1.5rem', fontWeight: '600', transition: 'all 0.3s ease' }}>
						<i className="fas fa-sign-in-alt me-2"></i>
						Login
					</Link>
				</div>
			</nav>

			{/* Main Content */}
			<div style={{ background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)', padding: '2rem 0', minHeight: 'calc(100vh - 76px)' }}>
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-lg-8 col-xl-6">
							<div className="card unila-card mb-5">
								<div className="card-header unila-card-header text-center">
									<h4 className="mb-0">
										<i className="fas fa-user-graduate me-3"></i>
										Registrasi Akun Mahasiswa
									</h4>
									<p className="mb-0 mt-2" style={{ fontSize: '0.95rem', opacity: '0.9', color: 'rgba(255,255,255,0.9)' }}>
										Isi data diri Anda dengan lengkap dan benar
									</p>
								</div>
								<div className="card-body p-4">
									

									{/* Error Alerts */}
									{validationErrors && <ValidationErrorAlert errors={validationErrors} onClose={() => setValidationErrors(null)} />}
									{apiError && <ErrorAlert error={apiError} onClose={() => setApiError('')} />}

									

									<form onSubmit={handleSubmit(handleRegister)}>
										{/* Nama Lengkap */}
										<div className="form-group">
											<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
												Nama Lengkap
												<span className="required-star">*</span>
											</label>
											<input
												name="nama"
												type="text"
												{...register('nama')}
												className={`form-control ${errors.nama ? 'is-invalid' : ''}`}
												placeholder="Masukkan nama lengkap sesuai KTP"
												style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
											/>
											<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
												<i className="fas fa-user me-1"></i>
												Gunakan nama lengkap sesuai KTP
											</div>
											{errors.nama && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle me-1"></i>
													{errors.nama.message}
												</div>
											)}
										</div>

										{/* Email */}
										<div className="form-group">
											<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
												Email
												<span className="required-star">*</span>
											</label>
											<input
												name="email"
												type="email"
												{...register('email')}
												className={`form-control ${errors.email ? 'is-invalid' : ''}`}
												placeholder="contoh@email.com"
												style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
											/>
											<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
												<i className="fas fa-envelope me-1"></i>
												Gunakan email aktif yang dapat dihubungi
											</div>
											{errors.email && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle me-1"></i>
													{errors.email.message}
												</div>
											)}
										</div>

										<div className="row">
											{/* Username */}
											<div className="col-md-6">
												<div className="form-group">
													<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
														Username
														<span className="required-star">*</span>
													</label>
													<input
														name="username"
														type="text"
														{...register('username')}
														className={`form-control ${errors.username ? 'is-invalid' : ''}`}
														placeholder="Buat username unik"
														style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
													/>
													<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
														<i className="fas fa-user-circle me-1"></i>
														Untuk login ke sistem
													</div>
													{errors.username && (
														<div className="error-message">
															<i className="fas fa-exclamation-circle me-1"></i>
															{errors.username.message}
														</div>
													)}
												</div>
											</div>

											{/* Password */}
											<div className="col-md-6">
												<div className="form-group">
													<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
														Password
														<span className="required-star">*</span>
													</label>
													<input
														name="password"
														type="password"
														{...register('password')}
														className={`form-control ${errors.password ? 'is-invalid' : ''}`}
														placeholder="Minimal 8 karakter"
														style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
													/>
													<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
														<i className="fas fa-lock me-1"></i>
														Minimal 8 karakter
													</div>
													{errors.password && (
														<div className="error-message">
															<i className="fas fa-exclamation-circle me-1"></i>
															{errors.password.message}
														</div>
													)}
												</div>
											</div>
										</div>

										<div className="row">
											{/* NPM */}
											<div className="col-md-6">
												<div className="form-group">
													<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
														NPM
														<span className="required-star">*</span>
													</label>
													<input
														name="npm"
														type="text"
														{...register('npm')}
														className={`form-control ${errors.npm ? 'is-invalid' : ''}`}
														placeholder="Contoh: 202201001"
														style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
													/>
													<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
														<i className="fas fa-id-card me-1"></i>
														Nomor Pokok Mahasiswa
													</div>
													{errors.npm && (
														<div className="error-message">
															<i className="fas fa-exclamation-circle me-1"></i>
															{errors.npm.message}
														</div>
													)}
												</div>
											</div>

											{/* Konsentrasi */}
											<div className="col-md-6">
												<div className="form-group">
													<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
														Konsentrasi
														<span className="required-star">*</span>
													</label>
													<select
														name="konsentrasi"
														{...register('konsentrasi')}
														className={`form-select ${errors.konsentrasi ? 'is-invalid' : ''}`}
														style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
													>
														<option value="">Pilih Konsentrasi</option>
														<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
														<option value="AI">AI</option>
														<option value="Jaringan Komputer">Jaringan Komputer</option>
														<option value="Teknologi Informasi">Teknologi Informasi</option>
													</select>
													<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
														<i className="fas fa-graduation-cap me-1"></i>
														Pilih konsentrasi studi Anda
													</div>
													{errors.konsentrasi && (
														<div className="error-message">
															<i className="fas fa-exclamation-circle me-1"></i>
															{errors.konsentrasi.message}
														</div>
													)}
												</div>
											</div>
										</div>

										<hr className="my-4" />

										{/* Important Information */}
										<div className="alert-info-custom p-4 mb-4">
											<h6 className="d-flex align-items-center mb-3" style={{ color: '#00509E' }}>
												<i className="fas fa-lightbulb me-2"></i>
												Informasi Penting
											</h6>
											<ul className="mb-0 ps-3" style={{ color: '#00509E' }}>
												<li className="mb-2">
													<i className="fas fa-check-circle me-2" style={{ color: '#28A745' }}></i>
													Gunakan email aktif yang dapat dihubungi
												</li>
												<li className="mb-2">
													<i className="fas fa-check-circle me-2" style={{ color: '#28A745' }}></i>
													Password minimal 8 karakter
												</li>
												<li className="mb-2">
													<i className="fas fa-check-circle me-2" style={{ color: '#28A745' }}></i>
													NPM harus sesuai dengan data akademik
												</li>
												<li className="mb-2">
													<i className="fas fa-check-circle me-2" style={{ color: '#28A745' }}></i>
													Pastikan data yang diisi sudah benar
												</li>
												
											</ul>
										</div>

										{/* Buttons */}
										<div className="d-flex justify-content-between mt-5">
											<Link to="/" className="btn unila-btn-secondary">
												
											</Link>
											<button 
												type="submit" 
												className="btn unila-btn-primary" 
												disabled={isLoading}
											>
												{isLoading ? (
													<>
														<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
														Mendaftarkan...
													</>
												) : (
													<>
														<i className="fas fa-user-plus me-2"></i>
														Daftar Akun Mahasiswa
													</>
												)}
											</button>
										</div>
									</form>

									{/* Login Link */}
									<div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
										<p className="text-muted mb-2">Sudah memiliki akun?</p>
										<Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#00509E' }}>
											<i className="fas fa-sign-in-alt me-2"></i>
											Login di sini
										</Link>
									</div>
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

export default Register;