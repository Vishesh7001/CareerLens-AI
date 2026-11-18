import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import Button from '../components/common/Button';
import InterviewReportView from '../components/interview/InterviewReportView';
import interviewService from '../services/interviewService';

const InterviewReportPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      setIsLoading(true);
      setError('');

      try {
        const res = await interviewService.getInterviewReport(interviewId);
        if (!isMounted) return;

        if (res?.success && res.report) {
          setReport(res.report);
        } else {
          throw new Error(res?.message || 'Failed to load interview report.');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve interview performance report.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-9 h-9 text-brand-primary animate-spin" />
        <p className="text-sm font-heading font-medium text-brand-muted">
          Synthesizing your interview performance report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4 bg-white rounded-3xl border border-brand-border shadow-soft-xs my-12">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-danger flex items-center justify-center mx-auto shadow-soft-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-heading font-bold text-brand-charcoal">Report Unavailable</h2>
        <p className="text-xs sm:text-sm text-brand-muted">
          {error || 'The requested performance report could not be found.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interview-history')}
          >
            Interview History
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={RotateCcw}
            onClick={() => navigate('/mock-interview')}
          >
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  return <InterviewReportView report={report} />;
};

export default InterviewReportPage;
