import React from 'react';

const FormTextarea = ({ label, name, register, error, placeholder, rows = 4, required = false, helperText }) => {
	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label">
				{label} {required && <span className="text-danger">*</span>}
			</label>
			<textarea className={`form-control ${error ? 'is-invalid' : ''}`} id={name} rows={rows} placeholder={placeholder} {...register(name)} />
			{helperText && <div className="form-text">{helperText}</div>}
			{error && <div className="invalid-feedback">{error.message}</div>}
		</div>
	);
};

export default FormTextarea;
