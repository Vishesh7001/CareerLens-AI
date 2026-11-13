import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-navy flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>

        <div className="space-y-2">
          <span className="text-6xl font-black text-brand-navy font-mono">404</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or return to safety.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

