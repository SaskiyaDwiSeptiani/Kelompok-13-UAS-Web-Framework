import React from 'react';

const FormFileInput = ({ label, name, register, error, accept, helperText, required = false }) => {
	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label">
				{label} {required && <span className="text-danger">*</span>}
			</label>
			<input type="file" className={`form-control ${error ? 'is-invalid' : ''}`} id={name} accept={accept} {...register(name)} />
			{helperText && <div className="form-text">{helperText}</div>}
			{error && <div className="invalid-feedback">{error.message}</div>}
		</div>
	);
};

export default FormFileInput;
