import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from './api/endpoints/auth';
import { loginSchema } from './validations/loginSchema';
import { useToast } from './hooks/useToast';
import ErrorAlert from './components/ErrorAlert';
import ValidationErrorAlert from './components/ValidationErrorAlert';

function Login() {
	const [userType, setUserType] = useState('mahasiswa'); // 'mahasiswa' atau 'dosen'
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
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: '',
			userType: 'mahasiswa',
		},
		mode: 'onChange',
	});

	// Menangani perubahan tipe user
	const handleUserTypeChange = (type) => {
		setUserType(type);
		setValue('userType', type);
		setValue('username', '');
		setValue('password', '');
		setApiError('');
		setValidationErrors(null);
	};

	// Format NPM untuk tampilan (menambahkan spasi setiap 3 digit)
	const formatNPM = (npm) => {
		if (!npm) return '';
		const cleaned = npm.replace(/\D/g, '');
		return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
	};

	// Handle perubahan input NPM
	const handleNPMChange = (e) => {
		const value = e.target.value.replace(/\D/g, '');
		const formatted = formatNPM(value);
		setValue('password', value);
		e.target.value = formatted;
	};

	// Handle perubahan input username/email
	const handleUsernameChange = (e) => {
		const value = e.target.value;
		setValue('username', value);

		// Jika user adalah mahasiswa dan input berupa NPM, set sebagai username
		if (userType === 'mahasiswa' && /^\d+$/.test(value.replace(/\s/g, ''))) {
			const npm = value.replace(/\s/g, '');
			setValue('username', npm);
		}
	};

	const handleLogin = async (data) => {
		setIsLoading(true);
		setApiError('');
		setValidationErrors(null);

		let loginData = { ...data };

		// Jika mahasiswa, pastikan password adalah NPM (hapus spasi)
		if (userType === 'mahasiswa') {
			loginData.password = data.password.replace(/\s/g, '');

			// Jika input berupa angka, anggap sebagai NPM untuk username
			if (/^\d+$/.test(data.username.replace(/\s/g, ''))) {
				loginData.username = data.username.replace(/\s/g, '');
			}
		}

		try {
			const response = await authAPI.login({
				username: loginData.username,
				password: loginData.password,
				userType,
			});

			if (response.token) {
				localStorage.setItem('token', response.token);
			}
			if (response.user) {
				localStorage.setItem('user', JSON.stringify(response.user));
				localStorage.setItem('userType', userType);
				localStorage.setItem('isAuthenticated', 'true');
			}

			showSuccess(`Login berhasil! Selamat datang ${userType === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}.`);
			reset();

			setTimeout(() => {
				navigate('/dashboard');
			}, 1000);
		} catch (err) {
			console.error('Login error:', err);

			if (err.response?.status === 422) {
				const errors = err.response?.data?.errors || err.response?.data?.message;
				setValidationErrors(errors);
				showError('Silakan periksa kembali data yang Anda inputkan');
			} else if (err.response?.status === 401) {
				const errorMsg = userType === 'mahasiswa' ? 'Username/Email/NPM atau Password salah!' : 'Username/Email atau Password salah!';
				setApiError(errorMsg);
				showError(errorMsg);
			} else {
				const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat login. Silakan coba lagi.';
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
					.user-type-btn {
						padding: 0.75rem;
						border: 2px solid #dee2e6;
						border-radius: 8px;
						background: white;
						cursor: pointer;
						transition: all 0.3s ease;
						flex: 1;
						text-align: center;
					}
					.user-type-btn.active {
						border-color: #00509E;
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.1) 0%, rgba(0, 58, 117, 0.05) 100%);
						color: #00509E;
						font-weight: 600;
					}
					.user-type-btn:hover:not(.active) {
						border-color: #00509E;
					}
					.unila-btn-primary {
						background: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						border: none;
						color: white;
						padding: 0.75rem 1.5rem;
						border-radius: 8px;
						font-weight: 500;
						transition: all 0.3s ease;
						width: 100%;
					}
					.unila-btn-primary:hover {
						transform: translateY(-2px);
						box-shadow: 0 5px 15px rgba(0, 80, 158, 0.3);
						color: white;
					}
					.info-box {
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.1) 0%, rgba(0, 58, 117, 0.05) 100%);
						border: 1px solid #4D82BC;
						border-left: 4px solid #00509E;
						border-radius: 8px;
						color: #00509E;
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
				`}
			</style>

			{/* Navbar */}
			<nav
				className="navbar navbar-expand-lg"
				style={{
					background: 'linear-gradient(135deg, #00509E 0%, #003A75 100%)',
					padding: '1rem 0',
					boxShadow: '0 2px 15px rgba(0, 80, 158, 0.2)',
					borderBottom: '4px solid #FFB81C',
					position: 'sticky',
					top: 0,
					zIndex: 1000,
				}}
			>
				<div className="container">
					<Link className="navbar-brand text-white fw-bold" to="/" style={{ fontSize: '1.4rem' }}>
						<i className="fas fa-graduation-cap me-2" style={{ color: '#FFB81C' }}></i>
						SEMINAR TI - Login
					</Link>
				</div>
			</nav>

			{/* Main Content */}
			<div style={{ background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)', padding: '2rem 0', minHeight: 'calc(100vh - 76px)' }}>
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-lg-6 col-xl-5">
							<div className="card unila-card mb-5">
								<div className="card-header unila-card-header text-center">
									<h4 className="mb-0">
										<i className="fas fa-sign-in-alt me-3"></i>
										Login Sistem Seminar
									</h4>
									<p className="mb-0 mt-2" style={{ fontSize: '0.95rem', opacity: '0.9', color: 'rgba(255,255,255,0.9)' }}>
										Pilih tipe user dan masuk dengan akun Anda
									</p>
								</div>
								<div className="card-body p-4">
									{/* User Type Selection */}
									<div className="mb-4">
										<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
											Tipe Pengguna
											<span className="required-star">*</span>
										</label>
										<div className="d-flex gap-3">
											<div className={`user-type-btn ${userType === 'mahasiswa' ? 'active' : ''}`} onClick={() => handleUserTypeChange('mahasiswa')}>
												<i className="fas fa-user-graduate me-2"></i>
												Mahasiswa
											</div>
											<div className={`user-type-btn ${userType === 'dosen' ? 'active' : ''}`} onClick={() => handleUserTypeChange('dosen')}>
												<i className="fas fa-chalkboard-teacher me-2"></i>
												Dosen
											</div>
										</div>
										<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
											{userType === 'mahasiswa' ? (
												<>
													<i className="fas fa-info-circle me-1"></i>
													Mahasiswa login dengan Username dan Email
												</>
											) : (
												<>
													<i className="fas fa-info-circle me-1"></i>
													Dosen login dengan Username/Email dan Password
												</>
											)}
										</div>
									</div>

									{/* Info Box berdasarkan tipe user */}
									{userType === 'mahasiswa' && (
										<div className="info-box p-3 mb-4">
											<div className="d-flex">
												<i className="fas fa-university me-3" style={{ fontSize: '1.2rem', color: '#00509E' }}></i>
												<div>
													<h6 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#00509E' }}>Login Mahasiswa</h6>
													<p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
														• Gunakan <strong>Username</strong> atau <strong>Email</strong> yang terdaftar
													</p>
													<p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
														• <strong>Password</strong> adalah <strong>NPM</strong> Anda (10-12 digit)
													</p>
													<p style={{ marginBottom: '0', fontSize: '0.9rem' }}>
														• Contoh: NPM <strong>2215061001</strong> atau <strong>221 506 1001</strong>
													</p>
												</div>
											</div>
										</div>
									)}

									{userType === 'dosen' && (
										<div className="info-box p-3 mb-4">
											<div className="d-flex">
												<i className="fas fa-user-tie me-3" style={{ fontSize: '1.2rem', color: '#00509E' }}></i>
												<div>
													<h6 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#00509E' }}>Login Dosen</h6>
													<p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
														• Gunakan <strong>Username</strong> atau <strong>Email</strong> yang terdaftar
													</p>
													<p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
														• Masukkan <strong>Password</strong> yang telah Anda buat
													</p>
													<p style={{ marginBottom: '0', fontSize: '0.9rem' }}></p>
												</div>
											</div>
										</div>
									)}

									{/* Error Alerts */}
									{validationErrors && <ValidationErrorAlert errors={validationErrors} onClose={() => setValidationErrors(null)} />}
									{apiError && <ErrorAlert error={apiError} onClose={() => setApiError('')} />}

									<form onSubmit={handleSubmit(handleLogin)}>
										{/* Username/Email/NPM */}
										<div className="form-group mb-3">
											<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
												{userType === 'mahasiswa' ? 'Username dan Email' : 'Username atau Email'}
												<span className="required-star">*</span>
											</label>
											<input
												type="text"
												{...register('username')}
												onChange={handleUsernameChange}
												className={`form-control ${errors.username ? 'is-invalid' : ''}`}
												placeholder={userType === 'mahasiswa' ? 'Masukkan username dan email' : 'Masukkan username atau email'}
												style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
											/>
											<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
												{userType === 'mahasiswa' ? (
													<>
														<i className="fas fa-info-circle me-1"></i>
														Mahasiswa bisa menggunakan NPM sebagai username
													</>
												) : (
													<>
														<i className="fas fa-user-circle me-1"></i>
														Gunakan username atau email yang terdaftar
													</>
												)}
											</div>
											{errors.username && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle me-1"></i>
													{errors.username.message}
												</div>
											)}
										</div>

										{/* Password/NPM */}
										<div className="form-group mb-4">
											<label className="d-flex align-items-center mb-2" style={{ fontWeight: '600', color: '#00509E', fontSize: '0.95rem' }}>
												{userType === 'mahasiswa' ? 'NPM' : 'Password'}
												<span className="required-star">*</span>
											</label>
											{userType === 'mahasiswa' ? (
												<input
													type="text"
													onChange={handleNPMChange}
													className={`form-control ${errors.password ? 'is-invalid' : ''}`}
													placeholder="Masukkan NPM (contoh: 221 506 1001)"
													maxLength="14" // Untuk format 221 506 1001 (10 digit + 3 spasi)
													style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef', letterSpacing: '1px' }}
												/>
											) : (
												<input
													type="password"
													{...register('password')}
													className={`form-control ${errors.password ? 'is-invalid' : ''}`}
													placeholder="Masukkan password"
													style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}
												/>
											)}
											<div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
												{userType === 'mahasiswa' ? (
													<>
														<i className="fas fa-id-card me-1"></i>
														NPM Anda adalah password (10-12 digit)
													</>
												) : (
													<>
														<i className="fas fa-lock me-1"></i>
														Password minimal 8 karakter
													</>
												)}
											</div>
											{errors.password && (
												<div className="error-message">
													<i className="fas fa-exclamation-circle me-1"></i>
													{userType === 'mahasiswa' ? 'NPM harus valid (10-12 digit)' : errors.password.message}
												</div>
											)}
										</div>

										{/* Hidden input untuk userType */}
										<input type="hidden" {...register('userType')} />

										{/* Login Button */}
										<div className="mb-4">
											<button type="submit" className="btn unila-btn-primary" disabled={isLoading}>
												{isLoading ? (
													<>
														<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
														Memproses...
													</>
												) : (
													<>
														<i className="fas fa-sign-in-alt me-2"></i>
														{userType === 'mahasiswa' ? 'Login sebagai Mahasiswa' : 'Login sebagai Dosen'}
													</>
												)}
											</button>
										</div>

										{/* Register Link - Hanya untuk Mahasiswa */}
										{userType === 'mahasiswa' && (
											<div className="text-center mb-3">
												<Link to="/register" className="text-decoration-none fw-bold" style={{ color: '#00509E' }}>
													<i className="fas fa-user-plus me-2"></i>
													Mahasiswa belum punya akun? Daftar di sini
												</Link>
											</div>
										)}
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

export default Login;
