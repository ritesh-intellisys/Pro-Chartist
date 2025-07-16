import * as yup from 'yup';

const phoneRegExp = /^[0-9]{10}$/;

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
});

export const signupSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  mobile: yup
    .string()
    .matches(phoneRegExp, 'Please enter a valid 10-digit mobile number')
    .required('Mobile number is required')
});

export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required')
});

export const leagueApplicationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  mobile: yup
    .string()
    .matches(phoneRegExp, 'Please enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  image: yup
    .mixed()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true; // Allow empty value, required check will handle this
      return value instanceof File && value.type.startsWith('image/');
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true; // Allow empty value, required check will handle this
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
});