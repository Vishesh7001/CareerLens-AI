import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
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

  // Determine redirection target (defaults to /dashboard)
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

      // Redirect to target or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
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
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your intelligent career dashboard
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
            <Input
              label="Password"
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              startIcon={Lock}
              endIcon={showPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowPassword(!showPassword)}
              required
              autoComplete="current-password"
            />

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>

              <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                Forgot password?
              </span>
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
                Sign In
              </Button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-brand-primary hover:text-brand-primaryHover transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

