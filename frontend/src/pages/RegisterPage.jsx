import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Target,
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

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-brand-slate">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-soft-xs group-hover:bg-brand-primaryHover transition-colors">
            <Target className="w-5 h-5 text-brand-forestLight" />
          </div>
          <span className="text-2xl font-heading font-bold text-brand-charcoal tracking-tight">
            CareerLens <span className="text-brand-primary font-serif italic text-3xl font-normal">AI</span>
          </span>
        </Link>
        <h2 className="mt-5 text-2xl sm:text-3xl font-heading font-bold text-brand-charcoal tracking-tight">
          Create Your Workspace
        </h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Start benchmarking your career potential with advanced AI
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-7 sm:p-9 shadow-soft-md border-brand-border">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 flex items-start gap-3 text-brand-danger text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Alex Morgan"
              startIcon={User}
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              disabled={isSubmitting}
            />

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="alex@university.edu"
              startIcon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
            />

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                startIcon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isSubmitting}
              />

              {/* Password Strength Visual Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => {
                      let bgColor = 'bg-brand-border';
                      if (passwordStrength.score >= step) {
                        if (passwordStrength.score <= 2) bgColor = 'bg-brand-warning';
                        else bgColor = 'bg-brand-primary';
                      }
                      return (
                        <div
                          key={step}
                          className={`flex-1 rounded-full ${bgColor} transition-colors duration-200`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-brand-muted">
                    <span>Password strength:</span>
                    <span className="font-heading font-semibold text-brand-charcoal">
                      {passwordStrength.feedback || 'Too weak'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Re-enter password"
              startIcon={Lock}
              endIcon={showConfirmPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isSubmitting}
            />

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-0.5 w-4 h-4 rounded text-brand-primary focus:ring-brand-primary/20 border-brand-border"
                />
                <span className="text-xs text-brand-slate leading-relaxed">
                  I agree to the{' '}
                  <span className="font-medium text-brand-primary underline cursor-not-allowed">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-medium text-brand-primary underline cursor-not-allowed">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-brand-danger">{errors.agreeTerms}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
              >
                Create Free Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-brand-border text-center text-xs sm:text-sm text-brand-muted">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-heading font-semibold text-brand-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-brand-muted">
          Your resume data is stored in isolated user directories with strict access control.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
