import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-forestLight border border-brand-sageBorder/60 flex items-center justify-center text-brand-primary mx-auto shadow-soft-xs">
          <Target className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-7xl font-serif font-black text-brand-charcoal tracking-tight">404</span>
          <h1 className="text-2xl font-heading font-bold text-brand-charcoal tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm font-sans text-brand-muted leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or return to your career workspace.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="font-heading font-semibold"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
            className="font-heading font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
