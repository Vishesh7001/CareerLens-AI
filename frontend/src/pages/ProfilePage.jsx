import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, CheckCircle2, AlertCircle, ShieldAlert, Save } from 'lucide-react';
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

  // Sync state if user context updates
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

    // Check if name has actually changed
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your personal information and verified account details
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Details & Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6 border-slate-200">
          <div className="w-20 h-20 rounded-full bg-brand-navy text-white text-2xl font-bold flex items-center justify-center shadow-md mb-4">
            {user?.fullName
              ? user.fullName.substring(0, 2).toUpperCase()
              : 'CL'}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {user?.fullName || 'User'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-full">
            {user?.email}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 w-full text-left space-y-2 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700 block">User ID:</span>
              <span className="font-mono break-all text-[11px] text-slate-400">
                {user?.id || 'Active'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Account Status:</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Active & Verified
              </span>
            </div>
          </div>
        </Card>

        {/* Right Side: Editable Details */}
        <Card className="md:col-span-2 space-y-6 border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500">
              Update your full name as it should appear across your resume and applications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Editable */}
            <Input
              label="Full Name"
              id="profileFullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
                if (successMessage) setSuccessMessage('');
              }}
              startIcon={User}
              required
            />

            {/* Email (Read-Only in Phase 1) */}
            <div>
              <Input
                label="Email Address (Locked)"
                id="profileEmail"
                name="email"
                type="email"
                value={user?.email || ''}
                disabled
                startIcon={Mail}
                helperText="Email addresses cannot be modified in Phase 1 for security and credential verification."
              />
            </div>

            {/* Account Metadata */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Account Created
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-1 block">
                  {formatDate(user?.createdAt)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last Updated
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-1 block">
                  {formatDate(user?.updatedAt || user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-end">
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
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

