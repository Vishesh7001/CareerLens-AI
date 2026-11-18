import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, CheckCircle2, AlertCircle, ShieldCheck, Save, Target } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateFullName } from '../utils/validation';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const nameError = validateFullName(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (fullName.trim() === user?.fullName) {
      setSuccessMessage('No changes to save.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ fullName: fullName.trim() });
      setSuccessMessage('Profile name updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brand-charcoal tracking-tight">
          Candidate Profile
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your personal workspace identity and verified credentials
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-brand-forestLight border border-brand-sageBorder/60 flex items-center gap-3 text-brand-primary text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50/70 border border-brand-danger/30 flex items-center gap-3 text-brand-danger text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-brand-danger flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Details & Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6 border-brand-border">
          <div className="w-20 h-20 rounded-2xl bg-brand-forestLight border border-brand-sageBorder/60 text-brand-primary text-2xl font-heading font-bold flex items-center justify-center shadow-soft-xs mb-4">
            {user?.fullName
              ? user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'U'}
          </div>

          <h3 className="text-base font-heading font-bold text-brand-charcoal">
            {user?.fullName || 'Candidate'}
          </h3>
          <p className="text-xs text-brand-muted mt-0.5 truncate max-w-full">
            {user?.email}
          </p>

          <div className="mt-5 w-full pt-4 border-t border-brand-border/70 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-brand-slate">
              <span className="text-brand-muted">Account Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-brand-slate">
              <span className="text-brand-muted">Member Since:</span>
              <span className="font-medium text-brand-charcoal">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Right Side: Form */}
        <Card className="md:col-span-2 p-6 sm:p-8 border-brand-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-brand-border/70 pb-4">
              <h3 className="text-lg font-heading font-bold text-brand-charcoal">
                Personal Information
              </h3>
              <p className="text-xs text-brand-muted mt-1">
                Your full name will be displayed across mock interview reports and resume diagnostics.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                id="fullName"
                name="fullName"
                type="text"
                required
                startIcon={User}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                placeholder="Your full name"
              />

              <Input
                label="Email Address (Locked)"
                id="email"
                name="email"
                type="email"
                disabled
                startIcon={Mail}
                value={user?.email || ''}
                helperText="Email cannot be changed after registration for session security."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>

          {/* Account Security Information */}
          <div className="mt-8 pt-6 border-t border-brand-border/70">
            <div className="flex items-start gap-3 text-xs text-brand-muted">
              <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-heading font-semibold text-brand-charcoal">Session Security & User Isolation</span>
                <p className="mt-0.5 leading-relaxed">
                  Your uploaded resumes, parsed profile records, target job postings, and mock interview transcripts are cryptographically isolated to your unique candidate identity.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
