import React from 'react';

/**
 * Komponen untuk menampilkan validation errors (422)
 * Error dapat berupa:
 * 1. String message: "Username sudah terdaftar"
 * 2. Array of errors: [{ field: "username", message: "sudah terdaftar" }]
 * 3. Object dengan field sebagai key: { username: "sudah terdaftar" }
 */
const ValidationErrorAlert = ({ errors, onClose }) => {
	if (!errors) return null;

	const styles = {
		container: {
			padding: '1rem',
			marginBottom: '1.5rem',
			backgroundColor: '#fff3cd',
			color: '#856404',
			border: '1px solid #ffeaa7',
			borderRadius: '6px',
			animation: 'slideIn 0.3s ease-in-out',
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			marginBottom: '0.5rem',
		},
		title: {
			fontWeight: '600',
			fontSize: '0.95rem',
			marginBottom: '0.5rem',
		},
		errorList: {
			margin: '0.5rem 0 0 0',
			paddingLeft: '1.5rem',
		},
		errorItem: {
			fontSize: '0.9rem',
			marginBottom: '0.25rem',
			listStyleType: 'disc',
		},
		closeButton: {
			background: 'none',
			border: 'none',
			color: '#856404',
			cursor: 'pointer',
			fontSize: '1.5rem',
			lineHeight: '1',
			padding: '0 0 0 1rem',
			transition: 'color 0.2s',
		},
	};

	const renderErrors = () => {
		// Jika errors adalah string
		if (typeof errors === 'string') {
			return (
				<ul style={styles.errorList}>
					<li style={styles.errorItem}>{errors}</li>
				</ul>
			);
		}

		// Jika errors adalah array
		if (Array.isArray(errors)) {
			return (
				<ul style={styles.errorList}>
					{errors.map((error, index) => {
						const message = typeof error === 'string' ? error : `${error.field || 'Field'}: ${error.message || JSON.stringify(error)}`;
						return (
							<li key={index} style={styles.errorItem}>
								{message}
							</li>
						);
					})}
				</ul>
			);
		}

		// Jika errors adalah object
		if (typeof errors === 'object') {
			const errorEntries = Object.entries(errors);
			return (
				<ul style={styles.errorList}>
					{errorEntries.map(([field, message], index) => {
						// message bisa berupa array atau string
						const msg = Array.isArray(message) ? message[0] : message;
						return (
							<li key={index} style={styles.errorItem}>
								<strong>{field}:</strong> {msg}
							</li>
						);
					})}
				</ul>
			);
		}

		return null;
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<div>
					<div style={styles.title}>⚠️ Validasi Error</div>
					{renderErrors()}
				</div>
				{onClose && (
					<button type="button" style={styles.closeButton} onClick={onClose} onMouseEnter={(e) => (e.target.style.color = '#533f03')} onMouseLeave={(e) => (e.target.style.color = '#856404')}>
						×
					</button>
				)}
			</div>
		</div>
	);
};

export default ValidationErrorAlert;
