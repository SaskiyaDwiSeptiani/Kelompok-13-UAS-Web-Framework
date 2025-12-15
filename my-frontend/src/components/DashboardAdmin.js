import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = ({ data }) => {
	const navigate = useNavigate();
	const { user, stats, seminars, jenis_seminar_stats } = data;

	const styles = {
		container: {
			padding: '20px',
			maxWidth: '1400px',
			margin: '0 auto',
		},
		header: {
			marginBottom: '30px',
		},
		title: {
			fontSize: '1.75rem',
			fontWeight: 'bold',
			marginBottom: '10px',
			color: '#333',
		},
		subtitle: {
			color: '#666',
			fontSize: '0.95rem',
		},
		statsGrid: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
			gap: '15px',
			marginBottom: '30px',
		},
		statCard: {
			backgroundColor: 'white',
			padding: '20px',
			borderRadius: '8px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
			textAlign: 'center',
		},
		statNumber: {
			fontSize: '2rem',
			fontWeight: 'bold',
			marginBottom: '5px',
		},
		statLabel: {
			color: '#666',
			fontSize: '0.85rem',
		},
		section: {
			backgroundColor: 'white',
			padding: '20px',
			borderRadius: '8px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
			marginBottom: '20px',
		},
		sectionTitle: {
			fontSize: '1.25rem',
			fontWeight: 'bold',
			marginBottom: '15px',
			color: '#333',
		},
		table: {
			width: '100%',
			borderCollapse: 'collapse',
		},
		th: {
			textAlign: 'left',
			padding: '12px',
			borderBottom: '2px solid #dee2e6',
			fontWeight: '600',
			color: '#495057',
			fontSize: '0.9rem',
		},
		td: {
			padding: '12px',
			borderBottom: '1px solid #dee2e6',
			fontSize: '0.9rem',
		},
		badge: {
			padding: '4px 12px',
			borderRadius: '12px',
			fontSize: '0.8rem',
			fontWeight: '500',
		},
		badgePending: {
			backgroundColor: '#fff3cd',
			color: '#856404',
		},
		badgeDisetujui: {
			backgroundColor: '#d4edda',
			color: '#155724',
		},
		badgeDitolak: {
			backgroundColor: '#f8d7da',
			color: '#721c24',
		},
		button: {
			padding: '6px 16px',
			backgroundColor: '#007bff',
			color: 'white',
			border: 'none',
			borderRadius: '4px',
			cursor: 'pointer',
			fontSize: '0.85rem',
		},
		grid2: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
			gap: '20px',
			marginBottom: '30px',
		},
	};

	const getStatusBadge = (status) => {
		let badgeStyle = { ...styles.badge };
		if (status === 'pending') badgeStyle = { ...badgeStyle, ...styles.badgePending };
		if (status === 'disetujui') badgeStyle = { ...badgeStyle, ...styles.badgeDisetujui };
		if (status === 'ditolak') badgeStyle = { ...badgeStyle, ...styles.badgeDitolak };

		return <span style={badgeStyle}>{status}</span>;
	};

	const formatDate = (dateString) => {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	};

	const jenisSeminarLabels = {
		seminar_proposal: 'Seminar Proposal',
		seminar_hasil: 'Seminar Hasil',
		seminar_kp: 'Seminar KP',
		seminar_umum: 'Seminar Umum',
		sidang_skripsi: 'Sidang Skripsi',
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h1 style={styles.title}>Dashboard Admin</h1>
				<p style={styles.subtitle}>Selamat datang, {user.nama}</p>
			</div>

			{/* Overall Statistics */}
			<div style={styles.section}>
				<h2 style={styles.sectionTitle}>Statistik Keseluruhan</h2>
				<div style={styles.statsGrid}>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#007bff' }}>{stats.total_seminars}</div>
						<div style={styles.statLabel}>Total Seminar</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#28a745' }}>{stats.disetujui}</div>
						<div style={styles.statLabel}>Disetujui</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#ffc107' }}>{stats.pending}</div>
						<div style={styles.statLabel}>Pending</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#dc3545' }}>{stats.ditolak}</div>
						<div style={styles.statLabel}>Ditolak</div>
					</div>
				</div>

				<div style={styles.statsGrid}>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#17a2b8' }}>{stats.total_users}</div>
						<div style={styles.statLabel}>Total Users</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#6c757d' }}>{stats.mahasiswa}</div>
						<div style={styles.statLabel}>Mahasiswa</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#6c757d' }}>{stats.dosen}</div>
						<div style={styles.statLabel}>Dosen</div>
					</div>
					<div style={styles.statCard}>
						<div style={{ ...styles.statNumber, color: '#6c757d' }}>{stats.admin}</div>
						<div style={styles.statLabel}>Admin</div>
					</div>
				</div>
			</div>

			{/* Statistics by Seminar Type */}
			{jenis_seminar_stats && (
				<div style={styles.section}>
					<h2 style={styles.sectionTitle}>Statistik Per Jenis Seminar</h2>
					<div style={styles.grid2}>
						{Object.entries(jenis_seminar_stats).map(([key, value]) => (
							<div key={key} style={styles.statCard}>
								<h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#333' }}>{jenisSeminarLabels[key] || key}</h3>
								<div style={{ display: 'flex', justifyContent: 'space-around' }}>
									<div>
										<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{value.total}</div>
										<div style={{ fontSize: '0.8rem', color: '#666' }}>Total</div>
									</div>
									<div>
										<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>{value.disetujui}</div>
										<div style={{ fontSize: '0.8rem', color: '#666' }}>Disetujui</div>
									</div>
									<div>
										<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>{value.pending}</div>
										<div style={{ fontSize: '0.8rem', color: '#666' }}>Pending</div>
									</div>
									<div>
										<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>{value.ditolak}</div>
										<div style={{ fontSize: '0.8rem', color: '#666' }}>Ditolak</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* All Seminars */}
			<div style={styles.section}>
				<h2 style={styles.sectionTitle}>Semua Seminar ({seminars?.length || 0})</h2>
				{seminars && seminars.length > 0 ? (
					<div style={{ overflowX: 'auto' }}>
						<table style={styles.table}>
							<thead>
								<tr>
									<th style={styles.th}>Mahasiswa</th>
									<th style={styles.th}>Judul</th>
									<th style={styles.th}>Jenis</th>
									<th style={styles.th}>Pembimbing 1</th>
									<th style={styles.th}>Pembimbing 2</th>
									<th style={styles.th}>Status</th>
									<th style={styles.th}>Tanggal</th>
									<th style={styles.th}>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{seminars.map((seminar) => (
									<tr key={seminar.id}>
										<td style={styles.td}>
											<div>{seminar.mahasiswa?.nama}</div>
											<div style={{ fontSize: '0.8rem', color: '#666' }}>{seminar.mahasiswa?.npm}</div>
										</td>
										<td style={styles.td}>{seminar.judul_seminar}</td>
										<td style={styles.td}>{seminar.jenis_seminar}</td>
										<td style={styles.td}>{seminar.pembimbing_1 || '-'}</td>
										<td style={styles.td}>{seminar.pembimbing_2 || '-'}</td>
										<td style={styles.td}>{getStatusBadge(seminar.status)}</td>
										<td style={styles.td}>{formatDate(seminar.tanggal_daftar)}</td>
										<td style={styles.td}>
											<button style={styles.button} onClick={() => navigate(`/detail-pendaftaran/${seminar.id}`)}>
												Detail
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Belum ada data seminar</div>
				)}
			</div>
		</div>
	);
};

export default DashboardAdmin;
