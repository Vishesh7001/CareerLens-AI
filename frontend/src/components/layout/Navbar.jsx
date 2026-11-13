import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, User, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              CareerLens <span className="text-brand-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
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
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              About
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
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

