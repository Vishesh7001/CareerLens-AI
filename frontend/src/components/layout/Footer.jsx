import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                CareerLens <span className="text-sky-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your Career. Your Potential. Your Future. An intelligent, data-driven platform designed to empower your professional trajectory.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Enterprise-grade security and data privacy.</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Resume Intelligence
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Skill Gap Analysis
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Career Roadmaps
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerLens AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for modern professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

