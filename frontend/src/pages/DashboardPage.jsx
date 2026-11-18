import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import OverviewStats from '../components/dashboard/OverviewStats';
import CareerReadinessCard from '../components/dashboard/CareerReadinessCard';
import CareerProgressCard from '../components/dashboard/CareerProgressCard';
import SkillIntelligenceCard from '../components/dashboard/SkillIntelligenceCard';
import CareerRecommendations from '../components/dashboard/CareerRecommendations';
import ResumeSection from '../components/resume/ResumeSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [overviewData, setOverviewData] = useState(null);
  const [skillIntelligence, setSkillIntelligence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, skillsRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getSkillIntelligence(),
      ]);

      if (overviewRes?.success) {
        setOverviewData(overviewRes);
      }
      if (skillsRes?.success) {
        setSkillIntelligence(skillsRes.skills);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
      setError(
        err.response?.data?.message || 'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-semibold text-slate-500 animate-pulse">
          Synthesizing Career Intelligence & Dashboard Insights...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto my-12 border-rose-200 bg-rose-50/30 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Dashboard Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
          Retry
        </Button>
      </Card>
    );
  }

  const stats = overviewData?.stats || {};
  const careerReadiness = overviewData?.careerReadiness || {};
  const recommendations = overviewData?.recommendations || [];

  // Determine top next action URL
  const nextActionUrl = recommendations[0]?.actionUrl || '/mock-interview';

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Welcome Section & Quick Actions */}
      <WelcomeSection
        user={user}
        careerReadiness={careerReadiness}
        nextActionUrl={nextActionUrl}
      />

      {/* 2. Overview Statistics KPI Cards */}
      <OverviewStats stats={stats} />

      {/* 3. Career Readiness Score Engine Card */}
      <CareerReadinessCard careerReadiness={careerReadiness} />

      {/* 4. Career Progress Pillars Overview */}
      <CareerProgressCard stats={stats} careerReadiness={careerReadiness} />

      {/* 5. Unified Skill Intelligence Card */}
      <SkillIntelligenceCard skillIntelligence={skillIntelligence || {}} />

      {/* 6. Personalized Career Recommendations */}
      <CareerRecommendations recommendations={recommendations} />

      {/* 7. Preserved Phase 2 Resume Management Dropzone & Details */}
      <div id="resume-section">
        <ResumeSection />
      </div>
    </div>
  );
};

export default DashboardPage;
