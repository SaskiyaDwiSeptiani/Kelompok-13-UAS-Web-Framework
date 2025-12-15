import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardMahasiswa = ({ data }) => {
	const navigate = useNavigate();
	const { user, stats, seminars, kuota_info } = data;

	const styles = {
		container: {
			padding: '20px',
			maxWidth: '1200px',
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
			gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
			gap: '20px',
			marginBottom: '30px',
		},
		statCard: {
			backgroundColor: 'white',
			padding: '20px',
			borderRadius: '8px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
		},
		statNumber: {
			fontSize: '2rem',
			fontWeight: 'bold',
			marginBottom: '5px',
		},
		statLabel: {
			color: '#666',
			fontSize: '0.9rem',
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
		},
		td: {
			padding: '12px',
			borderBottom: '1px solid #dee2e6',
		},
		badge: {
			padding: '4px 12px',
			borderRadius: '12px',
			fontSize: '0.85rem',
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
			fontSize: '0.9rem',
		},
		emptyState: {
			textAlign: 'center',
			padding: '40px',
			color: '#666',
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
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h1 style={styles.title}>Dashboard Mahasiswa</h1>
				<p style={styles.subtitle}>
					Selamat datang, {user.nama} ({user.npm})
				</p>
			</div>

			{/* Statistics Cards */}
			<div style={styles.statsGrid}>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#007bff' }}>{stats.total}</div>
					<div style={styles.statLabel}>Total Pendaftaran</div>
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

			{/* Seminars List */}
			<div style={styles.section}>
				<h2 style={styles.sectionTitle}>Daftar Seminar Saya</h2>
				{seminars && seminars.length > 0 ? (
					<div style={{ overflowX: 'auto' }}>
						<table style={styles.table}>
							<thead>
								<tr>
									<th style={styles.th}>Judul Seminar</th>
									<th style={styles.th}>Jenis</th>
									<th style={styles.th}>Tanggal Daftar</th>
									<th style={styles.th}>Status</th>
									<th style={styles.th}>Pembimbing 1</th>
									<th style={styles.th}>Pembimbing 2</th>
									<th style={styles.th}>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{seminars.map((seminar) => (
									<tr key={seminar.id}>
										<td style={styles.td}>{seminar.judul_seminar}</td>
										<td style={styles.td}>{seminar.jenis_seminar_text}</td>
										<td style={styles.td}>{formatDate(seminar.tanggal_daftar)}</td>
										<td style={styles.td}>{getStatusBadge(seminar.status)}</td>
										<td style={styles.td}>{seminar.pembimbing_1?.nama || '-'}</td>
										<td style={styles.td}>{seminar.pembimbing_2?.nama || '-'}</td>
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
					<div style={styles.emptyState}>
						<p>Belum ada pendaftaran seminar</p>
						<button style={styles.button} onClick={() => navigate('/daftar-seminar')}>
							Daftar Seminar
						</button>
					</div>
				)}
			</div>

			{/* Kuota Info */}
			{kuota_info && (
				<div style={styles.section}>
					<h2 style={styles.sectionTitle}>Informasi Kuota Seminar</h2>
					<div style={styles.statsGrid}>
						{Object.entries(kuota_info).map(([key, value]) => (
							<div key={key} style={styles.statCard}>
								<div style={styles.statNumber}>{value.tersisa || 0}</div>
								<div style={styles.statLabel}>
									{key.replace(/_/g, ' ')} (dari {value.total || 0})
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardMahasiswa;
