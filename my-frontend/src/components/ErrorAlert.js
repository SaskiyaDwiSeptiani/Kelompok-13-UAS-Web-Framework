import React from 'react';

const ErrorAlert = ({ error, onClose }) => {
	if (!error) return null;

	const styles = {
		container: {
			padding: '1rem',
			marginBottom: '1.5rem',
			backgroundColor: '#f8d7da',
			color: '#721c24',
			border: '1px solid #f5c6cb',
			borderRadius: '6px',
			fontSize: '0.9rem',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			animation: 'slideIn 0.3s ease-in-out',
		},
		errorMessage: {
			flex: 1,
		},
		closeButton: {
			background: 'none',
			border: 'none',
			color: '#721c24',
			cursor: 'pointer',
			fontSize: '1.5rem',
			lineHeight: '1',
			padding: '0 0 0 1rem',
			transition: 'color 0.2s',
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.errorMessage}>
				<strong>Error:</strong> {error}
			</div>
			{onClose && (
				<button type="button" style={styles.closeButton} onClick={onClose} onMouseEnter={(e) => (e.target.style.color = '#4c0519')} onMouseLeave={(e) => (e.target.style.color = '#721c24')}>
					×
				</button>
			)}
		</div>
	);
};

export default ErrorAlert;
