import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { seminarAPI } from './api/endpoints/seminar';
import { useToast } from './hooks/useToast';
import ErrorAlert from './components/ErrorAlert';

function DetailPendaftaran() {
	const navigate = useNavigate();
	const { id } = useParams();
	const { showError } = useToast();

	const [seminarData, setSeminarData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Mapping untuk jenis seminar
	const jenisSeminarMap = {
		seminar_proposal: 'Seminar Proposal',
		seminar_hasil: 'Seminar Hasil',
		seminar_kp: 'Seminar Kerja Praktek',
		seminar_umum: 'Seminar Umum',
		sidang_skripsi: 'Sidang Skripsi',
	};

	// Mapping untuk status badge
	const statusBadgeMap = {
		pending: { class: 'warning', text: 'Menunggu Review', icon: 'clock', color: '#FFB81C' },
		disetujui: { class: 'success', text: 'Disetujui', icon: 'check-circle', color: '#28A745' },
		ditolak: { class: 'danger', text: 'Ditolak', icon: 'times-circle', color: '#DC3545' },
	};

	useEffect(() => {
		loadSeminarDetail();
	}, [id]);

	const loadSeminarDetail = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await seminarAPI.getSeminarDetail(id);

			if (response.success) {
				setSeminarData(response.seminar);
			}
		} catch (err) {
			console.error('Error loading seminar detail:', err);

			if (err.response?.status === 404) {
				setError('Seminar tidak ditemukan');
			} else if (err.response?.status === 401) {
				showError('Sesi Anda telah berakhir. Silakan login kembali.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else {
				setError(err.response?.data?.message || 'Gagal memuat detail seminar');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownloadProposal = () => {
		if (seminarData?.file_proposal) {
			window.open(`http://localhost:8000/storage/proposals/${seminarData.file_proposal}`, '_blank');
		}
	};

	const handleDownloadReview = (fileReview) => {
		if (fileReview) {
			window.open(`http://localhost:8000/storage/proposals/${fileReview}`, '_blank');
		}
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

	const formatDateTime = (dateString) => {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch (error) {
			return '-';
		}
	};

	// Fungsi untuk memeriksa apakah ada review dengan jadwal alternatif
	const hasJadwalAlternatif = () => {
		if (!seminarData?.reviews) return false;
		return seminarData.reviews.some((review) => review.jadwal_alternatif === true);
	};

	// Fungsi untuk mendapatkan semua jadwal alternatif dari reviews
	const getJadwalAlternatif = () => {
		if (!seminarData?.reviews) return [];
		return seminarData.reviews
			.filter((review) => review.jadwal_alternatif === true)
			.map((review) => ({
				dosen: review.dosen?.nama || 'Dosen',
				peran: review.peran,
				tanggal: review.tanggal_alternatif,
				jam: review.jam_alternatif,
				ruang: review.ruang_alternatif,
				tanggal_review: review.tanggal_review,
			}));
	};

	if (isLoading) {
		return (
			<div className="unila-loading d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)' }}>
				<div className="text-center">
					<div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem', borderWidth: '0.3em' }}>
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-4 text-primary fw-bold">Memuat Detail Seminar...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
				<nav className="navbar navbar-expand-lg" style={{ background: 'linear-gradient(135deg, #00509E 0%, #003A75 100%)', padding: '1rem 0' }}>
					<div className="container">
						<Link className="navbar-brand text-white fw-bold" to="/dashboard">
							<i className="fas fa-graduation-cap me-2" style={{ color: '#FFB81C' }}></i>
							SEMINAR TI - Detail Pendaftaran
						</Link>
						<button
							className="btn"
							onClick={() => navigate('/dashboard')}
							style={{ background: 'rgba(255, 184, 28, 0.9)', color: '#003A75', borderRadius: '25px', padding: '0.5rem 1.5rem', fontWeight: '600' }}
						>
							<i className="fas fa-arrow-left me-2"></i>
							Kembali ke Dashboard
						</button>
					</div>
				</nav>
				<div className="container mt-5">
					<ErrorAlert error={error} onClose={() => navigate('/dashboard')} />
				</div>
			</div>
		);
	}

	if (!seminarData) {
		return null;
	}

	const statusInfo = statusBadgeMap[seminarData.status] || { class: 'secondary', text: seminarData.status, icon: 'question', color: '#6c757d' };
	const jadwalAlternatifList = getJadwalAlternatif();
	const hasAlternatif = hasJadwalAlternatif();

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
						padding: 1.25rem 1.5rem;
						border: none;
					}
					.unila-card-header-secondary {
						background: linear-gradient(135deg, #4D82BC 0%, #3a6ba8 100%);
					}
					.unila-card-header-success {
						background: linear-gradient(135deg, #28A745 0%, #1e7e34 100%);
					}
					.unila-card-header-warning {
						background: linear-gradient(135deg, #FFB81C 0%, #e0a800 100%);
						color: #003A75;
					}
					.unila-card-header-info {
						background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
					}
					.unila-card-header-purple {
						background: linear-gradient(135deg, #6f42c1 0%, #593196 100%);
					}
					.unila-btn-primary {
						background: linear-gradient(135deg, #00509E 0%, #003A75 100%);
						border: none;
						color: white;
						padding: 0.5rem 1.25rem;
						border-radius: 8px;
						font-weight: 500;
						transition: all 0.3s ease;
					}
					.unila-btn-primary:hover {
						transform: translateY(-2px);
						box-shadow: 0 5px 15px rgba(0, 80, 158, 0.3);
						color: white;
					}
					.unila-btn-outline {
						background: white;
						border: 2px solid #00509E;
						color: #00509E;
						padding: 0.5rem 1.25rem;
						border-radius: 8px;
						font-weight: 500;
						transition: all 0.3s ease;
					}
					.unila-btn-outline:hover {
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
					}
					.info-value {
						color: #00509E;
						font-weight: 600;
						font-size: 1rem;
					}
					.status-badge {
						padding: 0.5rem 1rem;
						border-radius: 25px;
						font-weight: 600;
						display: inline-block;
						font-size: 0.9rem;
					}
					.table-custom {
						border-collapse: separate;
						border-spacing: 0;
						width: 100%;
					}
					.table-custom td {
						padding: 1rem;
						border-bottom: 1px solid #f0f0f0;
						vertical-align: top;
					}
					.table-custom tr:last-child td {
						border-bottom: none;
					}
					.dosen-section {
						background: linear-gradient(135deg, rgba(0, 80, 158, 0.05) 0%, rgba(0, 58, 117, 0.02) 100%);
						border-radius: 10px;
						padding: 1rem;
						border-left: 4px solid #00509E;
					}
					.review-item {
						background: white;
						border-radius: 10px;
						padding: 1.25rem;
						margin-bottom: 1rem;
						border-left: 4px solid #4D82BC;
						box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
					}
					.jadwal-alternatif-item {
						background: linear-gradient(135deg, rgba(111, 66, 193, 0.08) 0%, rgba(89, 49, 150, 0.04) 100%);
						border-radius: 10px;
						padding: 1.25rem;
						margin-bottom: 1rem;
						border-left: 4px solid #6f42c1;
						box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
					}
					.jadwal-alternatif-label {
						color: #6f42c1;
						font-size: 0.85rem;
						font-weight: 600;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}
					.jadwal-alternatif-value {
						color: #6f42c1;
						font-weight: 600;
						font-size: 1rem;
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
					<Link className="navbar-brand text-white fw-bold" to="/dashboard" style={{ fontSize: '1.4rem' }}>
						<i className="fas fa-graduation-cap me-2" style={{ color: '#FFB81C' }}></i>
						SEMINAR TI - Detail Pendaftaran
					</Link>
					<button
						className="btn"
						onClick={() => navigate('/dashboard')}
						style={{ background: 'rgba(255, 184, 28, 0.9)', color: '#003A75', borderRadius: '25px', padding: '0.5rem 1.5rem', fontWeight: '600', transition: 'all 0.3s ease' }}
					>
						<i className="fas fa-arrow-left me-2"></i>
						Kembali ke Dashboard
					</button>
				</div>
			</nav>

			{/* Main Content */}
			<div style={{ background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%)', padding: '2rem 0', minHeight: 'calc(100vh - 76px)' }}>
				<div className="container">
					<div className="row">
						{/* Status Card */}
						<div className="col-lg-4 mb-4">
							<div className="card unila-card h-100">
								<div className="card-header unila-card-header text-center">
									<h5 className="mb-0">
										<i className="fas fa-info-circle me-2"></i>
										Status Pendaftaran
									</h5>
								</div>
								<div className="card-body text-center" style={{ padding: '2rem 1.5rem' }}>
									<div className="mb-4">
										<div className="mb-3">
											<i className={`fas fa-${statusInfo.icon} fa-3x`} style={{ color: statusInfo.color }}></i>
										</div>
										<div
											className="status-badge mb-3"
											style={{
												background:
													statusInfo.class === 'warning'
														? 'linear-gradient(135deg, #FFB81C 0%, #e0a800 100%)'
														: statusInfo.class === 'success'
														? 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
														: statusInfo.class === 'danger'
														? 'linear-gradient(135deg, #DC3545 0%, #c82333 100%)'
														: 'linear-gradient(135deg, #6c757d 0%, #545b62 100%)',
												color: statusInfo.class === 'warning' ? '#003A75' : 'white',
											}}
										>
											{statusInfo.text}
										</div>
									</div>

									<div className="text-start mb-3">
										<div className="info-label mb-1">
											<i className="fas fa-calendar-plus me-1"></i>
											Tanggal Pendaftaran
										</div>
										<div className="info-value">{formatDateTime(seminarData.tanggal_daftar)}</div>
									</div>

									{seminarData.tanggal_review && (
										<div className="text-start mb-3">
											<div className="info-label mb-1">
												<i className="fas fa-calendar-check me-1"></i>
												Tanggal Review
											</div>
											<div className="info-value">{formatDateTime(seminarData.tanggal_review)}</div>
										</div>
									)}

									{seminarData.nilai && (
										<div className="text-start mb-3">
											<div className="info-label mb-1">
												<i className="fas fa-star me-1"></i>
												Nilai
											</div>
											<div className="info-value" style={{ fontSize: '1.5rem', color: '#28A745' }}>
												{seminarData.nilai}
											</div>
										</div>
									)}

									{seminarData.catatan && (
										<div
											className="text-start mt-4 p-3"
											style={{ background: 'linear-gradient(135deg, rgba(255, 184, 28, 0.1) 0%, rgba(255, 184, 28, 0.05) 100%)', borderRadius: '10px', borderLeft: '4px solid #FFB81C' }}
										>
											<div className="info-label mb-2">
												<i className="fas fa-sticky-note me-1"></i>
												Catatan
											</div>
											<div style={{ whiteSpace: 'pre-wrap', color: '#003A75' }}>{seminarData.catatan}</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Detail Seminar */}
						<div className="col-lg-8">
							{/* Info Seminar */}
							<div className="card unila-card mb-4">
								<div className="card-header unila-card-header-secondary">
									<h5 className="mb-0">
										<i className="fas fa-book me-2"></i>
										Informasi Seminar
									</h5>
								</div>
								<div className="card-body">
									<table className="table-custom">
										<tbody>
											<tr>
												<td width="30%" className="info-label">
													Jenis Seminar
												</td>
												<td className="info-value">{seminarData.jenis_seminar_text || jenisSeminarMap[seminarData.jenis_seminar] || seminarData.jenis_seminar}</td>
											</tr>
											<tr>
												<td className="info-label">Judul</td>
												<td className="info-value">{seminarData.judul_seminar}</td>
											</tr>
											<tr>
												<td className="info-label align-top">Abstrak</td>
												<td style={{ whiteSpace: 'pre-wrap', color: '#495057' }}>{seminarData.abstrak}</td>
											</tr>
											<tr>
												<td className="info-label">File Proposal</td>
												<td>
													{seminarData.file_proposal ? (
														<button className="btn unila-btn-outline" onClick={handleDownloadProposal}>
															<i className="fas fa-download me-2"></i>
															Download Proposal
														</button>
													) : (
														<span className="text-muted">-</span>
													)}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							{/* Info Mahasiswa */}
							{seminarData.mahasiswa && (
								<div className="card unila-card mb-4">
									<div className="card-header unila-card-header-info">
										<h5 className="mb-0">
											<i className="fas fa-user-graduate me-2"></i>
											Informasi Mahasiswa
										</h5>
									</div>
									<div className="card-body">
										<table className="table-custom">
											<tbody>
												<tr>
													<td width="30%" className="info-label">
														Nama
													</td>
													<td className="info-value">{seminarData.mahasiswa.nama}</td>
												</tr>
												<tr>
													<td className="info-label">NPM</td>
													<td className="info-value">{seminarData.mahasiswa.npm}</td>
												</tr>
												<tr>
													<td className="info-label">Email</td>
													<td style={{ color: '#495057' }}>{seminarData.mahasiswa.email}</td>
												</tr>
												{seminarData.mahasiswa.konsentrasi && (
													<tr>
														<td className="info-label">Konsentrasi</td>
														<td style={{ color: '#495057' }}>{seminarData.mahasiswa.konsentrasi}</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{/* Jadwal Seminar */}
							<div className="card unila-card mb-4">
								<div className="card-header unila-card-header-success">
									<h5 className="mb-0">
										<i className="fas fa-calendar-alt me-2"></i>
										Jadwal Seminar
									</h5>
								</div>
								<div className="card-body">
									<table className="table-custom">
										<tbody>
											<tr>
												<td width="30%" className="info-label">
													Tanggal
												</td>
												<td className="info-value">{formatDate(seminarData.tanggal_seminar)}</td>
											</tr>
											<tr>
												<td className="info-label">Waktu</td>
												<td className="info-value">
													{seminarData.jam_mulai || '-'} - {seminarData.jam_selesai || '-'}
												</td>
											</tr>
											<tr>
												<td className="info-label">Ruang</td>
												<td className="info-value">{seminarData.ruang_seminar || '-'}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							{/* Jadwal Alternatif dari Review Dosen */}
							{hasAlternatif && (
								<div className="card unila-card mb-4">
									<div className="card-header unila-card-header-purple">
										<h5 className="mb-0">
											<i className="fas fa-calendar-times me-2"></i>
											Jadwal Alternatif dari Dosen
										</h5>
										<small className="opacity-75">Beberapa dosen mengusulkan jadwal alternatif karena tidak dapat hadir</small>
									</div>
									<div className="card-body">
										{jadwalAlternatifList.map((jadwal, index) => (
											<div key={index} className="jadwal-alternatif-item">
												<div className="d-flex justify-content-between align-items-start mb-3">
													<div>
														<h6 className="mb-1" style={{ color: '#6f42c1' }}>
															<i className="fas fa-user-tie me-2"></i>
															{jadwal.dosen}
														</h6>
														<div className="d-flex align-items-center flex-wrap gap-2">
															<span className="badge" style={{ background: '#6f42c1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '15px' }}>
																{jadwal.peran}
															</span>
															<small className="text-muted">Diusulkan: {formatDateTime(jadwal.tanggal_review)}</small>
														</div>
													</div>
												</div>
												<div className="row mt-3">
													<div className="col-md-4">
														<div className="mb-2">
															<div className="jadwal-alternatif-label">Tanggal Alternatif</div>
															<div className="jadwal-alternatif-value">{formatDate(jadwal.tanggal)}</div>
														</div>
													</div>
													<div className="col-md-4">
														<div className="mb-2">
															<div className="jadwal-alternatif-label">Jam Alternatif</div>
															<div className="jadwal-alternatif-value">{jadwal.jam}</div>
														</div>
													</div>
													<div className="col-md-4">
														<div className="mb-2">
															<div className="jadwal-alternatif-label">Ruang Alternatif</div>
															<div className="jadwal-alternatif-value">{jadwal.ruang}</div>
														</div>
													</div>
												</div>
											</div>
										))}
										<div className="alert alert-info mt-3 mb-0">
											<i className="fas fa-info-circle me-2"></i>
											Jadwal alternatif ini akan dipertimbangkan oleh koordinator seminar untuk penjadwalan ulang.
										</div>
										<div className="mt-3 text-center">
											<button className="btn unila-btn-primary" onClick={() => navigate(`/ubah-jadwal/${id}`)} style={{ padding: '0.75rem 2rem' }}>
												<i className="fas fa-calendar-edit me-2"></i>
												Ubah Jadwal Seminar
											</button>
										</div>
									</div>
								</div>
							)}

							{/* Dosen Pembimbing & Penguji */}
							<div className="card unila-card mb-4">
								<div className="card-header unila-card-header-warning">
									<h5 className="mb-0">
										<i className="fas fa-users me-2"></i>
										Pembimbing & Penguji
									</h5>
								</div>
								<div className="card-body">
									<div className="row">
										{/* Pembimbing 1 */}
										{seminarData.pembimbing_1 && (
											<div className="col-md-6 mb-3">
												<div className="dosen-section">
													<h6 className="mb-2" style={{ color: '#00509E' }}>
														<i className="fas fa-chalkboard-teacher me-2"></i>
														Pembimbing 1
													</h6>
													<div className="ms-3">
														<div className="info-value mb-1">{seminarData.pembimbing_1.nama}</div>
														<div className="text-muted small mb-1">
															<i className="fas fa-envelope me-1"></i>
															{seminarData.pembimbing_1.email}
														</div>
														{seminarData.pembimbing_1.konsentrasi && (
															<div className="text-muted small">
																<i className="fas fa-graduation-cap me-1"></i>
																{seminarData.pembimbing_1.konsentrasi}
															</div>
														)}
													</div>
												</div>
											</div>
										)}

										{/* Pembimbing 2 */}
										{seminarData.pembimbing_2 && (
											<div className="col-md-6 mb-3">
												<div className="dosen-section">
													<h6 className="mb-2" style={{ color: '#00509E' }}>
														<i className="fas fa-chalkboard-teacher me-2"></i>
														Pembimbing 2
													</h6>
													<div className="ms-3">
														<div className="info-value mb-1">{seminarData.pembimbing_2.nama}</div>
														<div className="text-muted small mb-1">
															<i className="fas fa-envelope me-1"></i>
															{seminarData.pembimbing_2.email}
														</div>
														{seminarData.pembimbing_2.konsentrasi && (
															<div className="text-muted small">
																<i className="fas fa-graduation-cap me-1"></i>
																{seminarData.pembimbing_2.konsentrasi}
															</div>
														)}
													</div>
												</div>
											</div>
										)}

										{/* Penguji 1 */}
										{seminarData.penguji_1 && (
											<div className="col-md-6 mb-3">
												<div className="dosen-section">
													<h6 className="mb-2" style={{ color: '#00509E' }}>
														<i className="fas fa-user-check me-2"></i>
														Penguji 1
													</h6>
													<div className="ms-3">
														<div className="info-value mb-1">{seminarData.penguji_1.nama}</div>
														<div className="text-muted small mb-1">
															<i className="fas fa-envelope me-1"></i>
															{seminarData.penguji_1.email}
														</div>
														{seminarData.penguji_1.konsentrasi && (
															<div className="text-muted small">
																<i className="fas fa-graduation-cap me-1"></i>
																{seminarData.penguji_1.konsentrasi}
															</div>
														)}
													</div>
												</div>
											</div>
										)}

										{/* Penguji 2 */}
										{seminarData.penguji_2 && (
											<div className="col-md-6 mb-3">
												<div className="dosen-section">
													<h6 className="mb-2" style={{ color: '#00509E' }}>
														<i className="fas fa-user-check me-2"></i>
														Penguji 2
													</h6>
													<div className="ms-3">
														<div className="info-value mb-1">{seminarData.penguji_2.nama}</div>
														<div className="text-muted small mb-1">
															<i className="fas fa-envelope me-1"></i>
															{seminarData.penguji_2.email}
														</div>
														{seminarData.penguji_2.konsentrasi && (
															<div className="text-muted small">
																<i className="fas fa-graduation-cap me-1"></i>
																{seminarData.penguji_2.konsentrasi}
															</div>
														)}
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Reviews */}
							{seminarData.reviews && seminarData.reviews.length > 0 && (
								<div className="card unila-card mb-4">
									<div className="card-header" style={{ background: 'linear-gradient(135deg, #212529 0%, #343a40 100%)', color: 'white' }}>
										<h5 className="mb-0">
											<i className="fas fa-comments me-2"></i>
											Review Dosen
										</h5>
									</div>
									<div className="card-body">
										{seminarData.reviews.map((review) => (
											<div key={review.id} className="review-item">
												<div className="d-flex justify-content-between align-items-start mb-3">
													<div>
														<h6 className="mb-1" style={{ color: '#00509E' }}>
															<i className="fas fa-user me-2"></i>
															{review.dosen?.nama || 'Dosen'}
														</h6>
														<div className="d-flex align-items-center">
															<span className="badge me-2" style={{ background: '#4D82BC', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '15px' }}>
																{review.peran}
															</span>
															<small className="text-muted">{formatDateTime(review.tanggal_review)}</small>
														</div>
													</div>
													<span
														className="status-badge"
														style={{
															background:
																review.status === 'disetujui'
																	? 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
																	: review.status === 'ditolak'
																	? 'linear-gradient(135deg, #DC3545 0%, #c82333 100%)'
																	: 'linear-gradient(135deg, #FFB81C 0%, #e0a800 100%)',
															color: review.status === 'warning' ? '#003A75' : 'white',
															fontSize: '0.8rem',
															padding: '0.3rem 0.8rem',
														}}
													>
														{review.status === 'disetujui' ? 'Disetujui' : review.status === 'ditolak' ? 'Ditolak' : 'Pending'}
													</span>
												</div>
												{review.catatan && (
													<div className="mt-3 p-3" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
														<small className="info-label mb-2 d-block">Catatan:</small>
														<div style={{ whiteSpace: 'pre-wrap', color: '#495057' }}>{review.catatan}</div>
													</div>
												)}
												{review.file_review && (
													<div className="mt-3">
														<button
															className="btn"
															onClick={() => handleDownloadReview(review.file_review)}
															style={{ background: 'white', border: '2px solid #6c757d', color: '#6c757d', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: '500' }}
														>
															<i className="fas fa-download me-2"></i>
															Download File Review
														</button>
													</div>
												)}
												{review.tanggal_alternatif && review.jam_alternatif && review.ruang_alternatif && (
													<div
														className="mt-3 p-3"
														style={{
															background: 'linear-gradient(135deg, rgba(111, 66, 193, 0.1) 0%, rgba(89, 49, 150, 0.05) 100%)',
															borderRadius: '8px',
															borderLeft: '3px solid #6f42c1',
														}}
													>
														<small className="jadwal-alternatif-label mb-2 d-block">
															<i className="fas fa-calendar-times me-1"></i>
															Jadwal Alternatif yang Diusulkan:
														</small>
														<div className="row">
															<div className="col-md-4">
																<small className="text-muted d-block">Tanggal</small>
																<div>{formatDate(review.tanggal_alternatif)}</div>
															</div>
															<div className="col-md-4">
																<small className="text-muted d-block">Jam</small>
																<div>{review.jam_alternatif}</div>
															</div>
															<div className="col-md-4">
																<small className="text-muted d-block">Ruang</small>
																<div>{review.ruang_alternatif}</div>
															</div>
														</div>
														<div className="mt-3 text-center">
															<button
																className="btn btn-sm"
																onClick={() => navigate(`/ubah-jadwal/${id}`)}
																style={{
																	background: 'linear-gradient(135deg, #6f42c1 0%, #593196 100%)',
																	color: 'white',
																	border: 'none',
																	padding: '0.5rem 1.5rem',
																	borderRadius: '8px',
																	fontWeight: '500',
																	transition: 'all 0.3s ease',
																}}
																onMouseOver={(e) => {
																	e.target.style.transform = 'translateY(-2px)';
																	e.target.style.boxShadow = '0 5px 15px rgba(111, 66, 193, 0.3)';
																}}
																onMouseOut={(e) => {
																	e.target.style.transform = 'translateY(0)';
																	e.target.style.boxShadow = 'none';
																}}
															>
																<i className="fas fa-calendar-edit me-2"></i>
																Ubah Jadwal
															</button>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}
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

export default DetailPendaftaran;
