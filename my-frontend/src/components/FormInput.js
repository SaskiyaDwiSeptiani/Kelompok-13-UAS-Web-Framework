import React from 'react';

const FormInput = ({ label, name, type = 'text', placeholder, register, errors, required = false, ...props }) => {
	const hasError = errors && errors[name];

	const styles = {
		formGroup: {
			marginBottom: '1rem',
		},
		formLabel: {
			display: 'block',
			marginBottom: '0.5rem',
			fontWeight: '500',
			color: '#333',
			fontSize: '0.9rem',
		},
		formControl: {
			width: '100%',
			padding: '0.75rem 1rem',
			fontSize: '1rem',
			border: hasError ? '1px solid #dc3545' : '1px solid #ddd',
			borderRadius: '6px',
			backgroundColor: 'white',
			transition: 'border-color 0.2s, box-shadow 0.2s',
			boxSizing: 'border-box',
			fontFamily: 'inherit',
		},
		errorMessage: {
			color: '#dc3545',
			fontSize: '0.875rem',
			marginTop: '0.25rem',
			display: 'block',
		},
	};

	return (
		<div style={styles.formGroup}>
			<label style={styles.formLabel}>
				{label}
				{required && <span style={{ color: '#dc3545' }}> *</span>}
			</label>
			<input type={type} {...register(name)} style={styles.formControl} placeholder={placeholder} {...props} />
			{hasError && <span style={styles.errorMessage}>{errors[name].message}</span>}
		</div>
	);
};

export default FormInput;
