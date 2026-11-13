import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  validateEmail,
  validateFullName,
  checkPasswordStrength,
  validatePasswordMatch,
} from '../utils/validation';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password strength
  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameErr = validateFullName(formData.fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!passwordStrength.isValid) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers.';
    }

    const matchErr = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (matchErr) newErrors.confirmPassword = matchErr;

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service to register.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Redirect directly to dashboard upon successful registration
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            CareerLens <span className="text-brand-primary">AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Start your intelligent career journey in seconds
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 border-slate-200">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              startIcon={User}
              required
              autoComplete="name"
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              startIcon={Mail}
              required
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                startIcon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                required
                autoComplete="new-password"
              />

              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Strength:</span>
                    <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              startIcon={Lock}
              endIcon={showConfirmPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              required
              autoComplete="new-password"
            />

            {/* Terms and Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I agree to the{' '}
                  <span className="text-brand-primary hover:underline font-medium">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-brand-primary hover:underline font-medium">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-red-600">{errors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-brand-primary hover:text-brand-primaryHover transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

