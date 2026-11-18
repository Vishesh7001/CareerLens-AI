import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Target } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3.5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-soft-xs group-hover:bg-brand-primaryHover transition-colors">
              <Target className="w-5 h-5 text-brand-forestLight" />
            </div>
            <span className="text-xl font-heading font-bold text-brand-charcoal tracking-tight">
              CareerLens <span className="text-brand-primary font-serif italic text-2xl font-normal">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-heading font-medium text-brand-slate hover:text-brand-charcoal transition-colors"
            >
              Platform Pillars
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-heading font-medium text-brand-slate hover:text-brand-charcoal transition-colors"
            >
              How It Works
            </a>
            <a
              href="#readiness"
              className="text-sm font-heading font-medium text-brand-slate hover:text-brand-charcoal transition-colors"
            >
              Career Readiness
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                onClick={() => navigate('/dashboard')}
              >
                Enter Your Workspace
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="text-brand-charcoal"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-brand-charcoal hover:bg-brand-bgMuted transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-white px-5 pt-3 pb-6 space-y-4 shadow-soft-md animate-in fade-in duration-150">
          <div className="flex flex-col space-y-2.5">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-heading font-medium text-brand-charcoal hover:bg-brand-bg rounded-xl"
            >
              Platform Pillars
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-heading font-medium text-brand-charcoal hover:bg-brand-bg rounded-xl"
            >
              How It Works
            </a>
            <a
              href="#readiness"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-heading font-medium text-brand-charcoal hover:bg-brand-bg rounded-xl"
            >
              Career Readiness
            </a>
          </div>

          <div className="pt-3 border-t border-brand-border/60 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                variant="primary"
                fullWidth
                icon={ArrowRight}
                onClick={() => navigate('/dashboard')}
              >
                Enter Your Workspace
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
