import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardDosen = ({ data }) => {
	const navigate = useNavigate();
	const { user, stats, bimbingan, pengujian, pending_review } = data;

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
			gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
			gap: '15px',
			marginBottom: '30px',
		},
		statCard: {
			backgroundColor: 'white',
			padding: '15px',
			borderRadius: '8px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
		},
		statNumber: {
			fontSize: '1.5rem',
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
		emptyState: {
			textAlign: 'center',
			padding: '40px',
			color: '#666',
		},
		tabs: {
			display: 'flex',
			gap: '10px',
			marginBottom: '20px',
			borderBottom: '2px solid #dee2e6',
		},
		tab: {
			padding: '10px 20px',
			cursor: 'pointer',
			border: 'none',
			backgroundColor: 'transparent',
			borderBottom: '3px solid transparent',
			fontSize: '0.95rem',
			fontWeight: '500',
		},
		activeTab: {
			borderBottom: '3px solid #007bff',
			color: '#007bff',
		},
	};

	const [activeTab, setActiveTab] = React.useState('pending');

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

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h1 style={styles.title}>Dashboard Dosen</h1>
				<p style={styles.subtitle}>Selamat datang, {user.nama}</p>
			</div>

			{/* Statistics Cards */}
			<div style={styles.statsGrid}>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#007bff' }}>{stats.total_bimbingan}</div>
					<div style={styles.statLabel}>Total Bimbingan</div>
				</div>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#ffc107' }}>{stats.bimbingan_pending}</div>
					<div style={styles.statLabel}>Bimbingan Pending</div>
				</div>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#007bff' }}>{stats.total_pengujian}</div>
					<div style={styles.statLabel}>Total Pengujian</div>
				</div>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#ffc107' }}>{stats.pengujian_pending}</div>
					<div style={styles.statLabel}>Pengujian Pending</div>
				</div>
				<div style={styles.statCard}>
					<div style={{ ...styles.statNumber, color: '#dc3545' }}>{stats.total_pending_review}</div>
					<div style={styles.statLabel}>Perlu Review</div>
				</div>
			</div>

			{/* Pending Review Section */}
			<div style={styles.section}>
				<h2 style={styles.sectionTitle}>Seminar Perlu Review ({pending_review?.length || 0})</h2>
				{pending_review && pending_review.length > 0 ? (
					<div style={{ overflowX: 'auto' }}>
						<table style={styles.table}>
							<thead>
								<tr>
									<th style={styles.th}>Mahasiswa</th>
									<th style={styles.th}>Judul</th>
									<th style={styles.th}>Jenis</th>
									<th style={styles.th}>Peran</th>
									<th style={styles.th}>Tanggal</th>
									<th style={styles.th}>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{pending_review.map((item) => (
									<tr key={item.id}>
										<td style={styles.td}>
											<div>{item.mahasiswa?.nama}</div>
											<div style={{ fontSize: '0.8rem', color: '#666' }}>{item.mahasiswa?.npm}</div>
										</td>
										<td style={styles.td}>{item.judul_seminar}</td>
										<td style={styles.td}>{item.jenis_seminar}</td>
										<td style={styles.td}>{item.peran}</td>
										<td style={styles.td}>{formatDate(item.tanggal_daftar)}</td>
										<td style={styles.td}>
											<button style={styles.button} onClick={() => navigate(`/review-pendaftaran/${item.id}`)}>
												Review
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div style={styles.emptyState}>Tidak ada seminar yang perlu direview</div>
				)}
			</div>

			{/* Tabs for Bimbingan and Pengujian */}
			<div style={styles.section}>
				<div style={styles.tabs}>
					<button
						style={{ ...styles.tab, ...(activeTab === 'bimbingan' ? styles.activeTab : {}) }}
						onClick={() => setActiveTab('bimbingan')}
					>
						Bimbingan ({bimbingan?.length || 0})
					</button>
					<button
						style={{ ...styles.tab, ...(activeTab === 'pengujian' ? styles.activeTab : {}) }}
						onClick={() => setActiveTab('pengujian')}
					>
						Pengujian ({pengujian?.length || 0})
					</button>
				</div>

				{activeTab === 'bimbingan' && (
					<div style={{ overflowX: 'auto' }}>
						{bimbingan && bimbingan.length > 0 ? (
							<table style={styles.table}>
								<thead>
									<tr>
										<th style={styles.th}>Mahasiswa</th>
										<th style={styles.th}>Judul</th>
										<th style={styles.th}>Jenis</th>
										<th style={styles.th}>Status</th>
										<th style={styles.th}>Tanggal</th>
										<th style={styles.th}>Aksi</th>
									</tr>
								</thead>
								<tbody>
									{bimbingan.map((item) => (
										<tr key={item.id}>
											<td style={styles.td}>
												<div>{item.mahasiswa?.nama}</div>
												<div style={{ fontSize: '0.8rem', color: '#666' }}>{item.mahasiswa?.npm}</div>
											</td>
											<td style={styles.td}>{item.judul_seminar}</td>
											<td style={styles.td}>{item.jenis_seminar}</td>
											<td style={styles.td}>{getStatusBadge(item.status)}</td>
											<td style={styles.td}>{formatDate(item.tanggal_daftar)}</td>
											<td style={styles.td}>
												<button style={styles.button} onClick={() => navigate(`/detail-pendaftaran/${item.id}`)}>
													Detail
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div style={styles.emptyState}>Tidak ada data bimbingan</div>
						)}
					</div>
				)}

				{activeTab === 'pengujian' && (
					<div style={{ overflowX: 'auto' }}>
						{pengujian && pengujian.length > 0 ? (
							<table style={styles.table}>
								<thead>
									<tr>
										<th style={styles.th}>Mahasiswa</th>
										<th style={styles.th}>Judul</th>
										<th style={styles.th}>Jenis</th>
										<th style={styles.th}>Peran</th>
										<th style={styles.th}>Status</th>
										<th style={styles.th}>Aksi</th>
									</tr>
								</thead>
								<tbody>
									{pengujian.map((item) => (
										<tr key={item.id}>
											<td style={styles.td}>
												<div>{item.mahasiswa?.nama}</div>
												<div style={{ fontSize: '0.8rem', color: '#666' }}>{item.mahasiswa?.npm}</div>
											</td>
											<td style={styles.td}>{item.judul_seminar}</td>
											<td style={styles.td}>{item.jenis_seminar}</td>
											<td style={styles.td}>{item.peran}</td>
											<td style={styles.td}>{getStatusBadge(item.status)}</td>
											<td style={styles.td}>
												<button style={styles.button} onClick={() => navigate(`/detail-pendaftaran/${item.id}`)}>
													Detail
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div style={styles.emptyState}>Tidak ada data pengujian</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardDosen;
