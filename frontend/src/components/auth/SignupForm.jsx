import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateLicensePlate,
  getPasswordStrength
} from '../../utils/validators';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Lock, Mail, User, Car, ShieldAlert, Check } from 'lucide-react';

/**
 * SignupForm.jsx - Registration form with inline validation, password strength meter, and role selection.
 * UI/UX Principles:
 * - Nielsen #5 (Error Prevention): Real-time password strength cues guide users to create valid passwords.
 * - Accessibility (WCAG 3.3.2): Clear instructions for each input, autofocus on first invalid entry.
 * - Business Rule: Admin accounts are protected and cannot be self-registered.
 */

export default function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    password: '',
    confirmPassword: '',
    licensePlate: '',
    vehicleModel: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const confirmRef = useRef(null);
  const plateRef = useRef(null);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    let err = null;
    if (field === 'name') err = validateName(formData.name);
    if (field === 'email') err = validateEmail(formData.email);
    if (field === 'password') err = validatePassword(formData.password);
    if (field === 'confirmPassword') {
      if (!formData.confirmPassword) err = 'Please confirm your password.';
      else if (formData.password !== formData.confirmPassword) err = 'Passwords do not match.';
    }
    if (field === 'licensePlate') err = validateLicensePlate(formData.licensePlate);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword:
        formData.password !== formData.confirmPassword
          ? 'Passwords do not match.'
          : !formData.confirmPassword
          ? 'Please confirm your password.'
          : null,
      licensePlate: validateLicensePlate(formData.licensePlate)
    };

    // Filter out nulls
    const cleanErrors = Object.fromEntries(
      Object.entries(formErrors).filter(([_, v]) => v !== null)
    );

    if (Object.keys(cleanErrors).length > 0) {
      setErrors(cleanErrors);
      // Focus first invalid field
      if (cleanErrors.name && nameRef.current) nameRef.current.focus();
      else if (cleanErrors.email && emailRef.current) emailRef.current.focus();
      else if (cleanErrors.password && passRef.current) passRef.current.focus();
      else if (cleanErrors.confirmPassword && confirmRef.current) confirmRef.current.focus();
      else if (cleanErrors.licensePlate && plateRef.current) plateRef.current.focus();
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newUser = await signup(formData);
      addToast({
        type: 'success',
        title: 'Account Created!',
        message: `Welcome to CampusPark, ${newUser.name}.`
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join the campus parking network with your college identity.
          </p>
        </div>

        {errors.form && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 rounded-xl text-xs flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="signup-name"
            label="Full Name"
            type="text"
            placeholder="e.g. Jordan Lee"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            icon={User}
            autoComplete="name"
            required
            ref={nameRef}
          />

          <Input
            id="signup-email"
            label="College Email"
            type="email"
            placeholder="e.g. jlee@campus.edu"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            hint="Use your university .edu address if available."
            icon={Mail}
            autoComplete="email"
            required
            ref={emailRef}
          />

          <Select
            id="signup-role"
            label="Campus Affiliation Role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            options={[
              { value: 'Student', label: 'Student (Undergrad / Grad)' },
              { value: 'Faculty', label: 'Faculty / Professor' },
              { value: 'Staff', label: 'Campus Staff / Administrative' },
              { value: 'Visitor', label: 'Visitor / Campus Guest' }
            ]}
            hint="Admin roles require internal provisioning by Campus Facilities."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="signup-plate"
              label="License Plate"
              type="text"
              placeholder="e.g. ABC-1234"
              value={formData.licensePlate}
              onChange={(e) => handleChange('licensePlate', e.target.value)}
              onBlur={() => handleBlur('licensePlate')}
              error={errors.licensePlate}
              icon={Car}
              autoComplete="off"
              inputMode="text"
              required
              ref={plateRef}
            />

            <Input
              id="signup-model"
              label="Car Model"
              type="text"
              placeholder="e.g. Honda Civic"
              value={formData.vehicleModel}
              onChange={(e) => handleChange('vehicleModel', e.target.value)}
            />
          </div>

          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            icon={Lock}
            autoComplete="new-password"
            required
            ref={passRef}
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1.5 -mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password strength:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-colors ${
                      step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <Input
            id="signup-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            icon={Lock}
            autoComplete="new-password"
            required
            ref={confirmRef}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-4"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-700 dark:text-brand-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
