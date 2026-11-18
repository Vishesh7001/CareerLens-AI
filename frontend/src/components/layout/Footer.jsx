import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Shield, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-charcoal text-[#C2C9C2] border-t border-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-soft-xs">
                <Target className="w-5 h-5 text-brand-forestLight" />
              </div>
              <span className="text-xl font-heading font-bold text-white tracking-tight">
                CareerLens <span className="text-brand-forestLight font-serif italic text-2xl font-normal">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#9FA89F] max-w-sm leading-relaxed font-sans">
              "Your Career. Your Potential. Your Future." An intelligent career preparation workspace uniting resume intelligence, ATS benchmarking, job matching, dynamic roadmaps, and mock interviews.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#828B82] pt-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Enterprise-grade authentication & data isolation.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8B2A8]">
              <li>
                <Link to="/analysis" className="hover:text-white transition-colors flex items-center gap-1">
                  Resume ATS Analysis
                </Link>
              </li>
              <li>
                <Link to="/job-matching" className="hover:text-white transition-colors flex items-center gap-1">
                  Job Compatibility Match
                </Link>
              </li>
              <li>
                <Link to="/career-recommendations" className="hover:text-white transition-colors flex items-center gap-1">
                  Career Trajectories
                </Link>
              </li>
              <li>
                <Link to="/roadmaps" className="hover:text-white transition-colors flex items-center gap-1">
                  Learning Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              Preparation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8B2A8]">
              <li>
                <Link to="/mock-interview" className="hover:text-white transition-colors">
                  AI Mock Interview
                </Link>
              </li>
              <li>
                <Link to="/interview-history" className="hover:text-white transition-colors">
                  Session Performance
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Career Readiness Dial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-heading font-bold text-white tracking-wider uppercase mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8B2A8]">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Workspace
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A837A]">
          <p>© {new Date().getFullYear()} CareerLens AI. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Engineered for ambitious college students & professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
