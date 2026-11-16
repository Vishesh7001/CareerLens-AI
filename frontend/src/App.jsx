import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AnalysisPage from './pages/AnalysisPage';
import JobsPage from './pages/JobsPage';
import JobMatchingPage from './pages/JobMatchingPage';
import CareerRecommendationsPage from './pages/CareerRecommendationsPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import ActiveInterviewPage from './pages/ActiveInterviewPage';
import InterviewReportPage from './pages/InterviewReportPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard & User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnalysisPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-matching"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobMatchingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-recommendations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CareerRecommendationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmaps"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LearningRoadmapPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InterviewSetupPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview/:interviewId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ActiveInterviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview/:interviewId/report"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InterviewReportPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-history"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InterviewHistoryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;

