import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Target, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { validateEmail } from '../utils/validation';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

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

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (!formData.password) {
      newErrors.password = 'Password is required.';
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
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
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
          Welcome Back
        </h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Sign in to access your intelligent career workspace
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

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="candidate@example.com"
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
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                startIcon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary/20 border-brand-border"
                />
                <span className="text-brand-slate font-medium">Keep me signed in</span>
              </label>
              <span className="text-brand-muted hover:text-brand-charcoal text-xs cursor-not-allowed">
                Forgot password?
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-brand-border text-center text-xs sm:text-sm text-brand-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-heading font-semibold text-brand-primary hover:underline"
            >
              Create Account
            </Link>
          </div>
        </Card>

        {/* Security badge note */}
        <p className="mt-6 text-center text-xs text-brand-muted">
          Protected by HTTP-only encrypted session cookies and user isolation.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
