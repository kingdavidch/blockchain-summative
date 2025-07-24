import * as yup from 'yup';
import { parseInputDate, isFutureDate } from './dates';

export const emailValidator = yup
  .string()
  .email('Please enter a valid email address')
  .required('Email is required');

export const passwordValidator = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
  .required('Password is required');

export const confirmPasswordValidator = yup
  .string()
  .oneOf([yup.ref('password')], 'Passwords must match')
  .required('Please confirm your password');

export const nameValidator = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .required('Name is required');

export const dateOfBirthValidator = yup
  .string()
  .test('valid-date', 'Please enter a valid date', (value) => {
    if (!value) return false;
    const date = parseInputDate(value);
    return !isNaN(date.getTime());
  })
  .test('not-future', 'Date of birth cannot be in the future', (value) => {
    if (!value) return true; // Let required handle empty values
    const date = parseInputDate(value);
    return !isFutureDate(date);
  })
  .test('minimum-age', 'You must be at least 18 years old', (value) => {
    if (!value) return true; // Let required handle empty values
    const date = parseInputDate(value);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return date <= minDate;
  })
  .required('Date of birth is required');

export const ethAddressValidator = yup
  .string()
  .matches(
    /^0x[a-fA-F0-9]{40}$/,
    'Please enter a valid Ethereum address'
  )
  .required('Ethereum address is required');

export const ipfsHashValidator = yup
  .string()
  .matches(
    /^Qm[1-9a-zA-Z]{44,}$|^b[2-7a-zA-Z]{58,}$/,
    'Please enter a valid IPFS hash'
  )
  .required('IPFS hash is required');

export const recordTitleValidator = yup
  .string()
  .min(3, 'Title must be at least 3 characters')
  .max(100, 'Title must be less than 100 characters')
  .required('Title is required');

export const recordDescriptionValidator = yup
  .string()
  .max(1000, 'Description must be less than 1000 characters');

export const fileValidator = yup
  .mixed<File>()
  .test('file-size', 'File is too large', (value) => {
    if (!value) return true; // Let required handle empty values
    return value.size <= 10 * 1024 * 1024; // 10MB
  })
  .test('file-type', 'Unsupported file type', (value) => {
    if (!value) return true; // Let required handle empty values
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return allowedTypes.includes(value.type);
  });

// Form schemas
export const loginSchema = yup.object().shape({
  email: emailValidator,
  password: yup.string().required('Password is required'),
});

export const signupSchema = yup.object().shape({
  firstName: nameValidator,
  lastName: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: confirmPasswordValidator,
  dateOfBirth: dateOfBirthValidator,
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export const addRecordSchema = yup.object().shape({
  title: recordTitleValidator,
  description: recordDescriptionValidator,
  date: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
  file: yup
    .mixed()
    .test('required', 'File is required', (value) => value && value.length > 0)
    .test('fileSize', 'File is too large', (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 10 * 1024 * 1024; // 10MB
    })
    .test('fileType', 'Unsupported file type', (value) => {
      if (!value || !value[0]) return true;
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      return allowedTypes.includes(value[0].type);
    }),
});

export const shareAccessSchema = yup.object().shape({
  doctorAddress: ethAddressValidator,
  recordHash: yup.string().required('Please select a record'),
});

export const requestAccessSchema = yup.object().shape({
  patientAddress: ethAddressValidator,
  message: yup.string().max(500, 'Message must be less than 500 characters'),
});

// Utility function to format validation errors for display
export const formatValidationErrors = (error: yup.ValidationError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (error.inner.length === 0) {
    // Handle top-level error
    errors[error.path || 'general'] = error.message;
    return errors;
  }
  
  // Handle nested errors
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  
  return errors;
};

// Utility function to validate a value against a schema
export const validateField = async (
  schema: yup.AnySchema,
  value: any,
  context: Record<string, any> = {}
): Promise<string | null> => {
  try {
    await schema.validate(value, { context });
    return null; // No error
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation failed';
  }
};
