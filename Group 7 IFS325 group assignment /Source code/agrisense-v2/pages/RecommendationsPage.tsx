import React from 'react';
import { useData } from '../context/DataContext';
import Loader from '../components/Loader';

const priorityClasses = {
  High: 'border-red-500 bg-red-50',
  Medium: 'border-yellow-500 bg-yellow-50',
  Low: 'border-green-500 bg-green-50',
};

const iconClasses = {
  High: 'text-red-500',
  Medium: 'text-yellow-500',
  Low: 'text-green-500',
};

const icons = {
  High: 'priority_high',
  Medium: 'report_problem',
  Low: 'check_circle',
};

const RecommendationsPage: React.FC = () => {
  const {
    recommendations,
    recommendationsLoading,
    regenerateRecommendations,
    loading: dataLoading,
    error: dataError,
  } = useData();

  const renderContent = () => {
    if (recommendationsLoading && recommendations.length === 0) {
      return <div className="flex justify-center items-center h-48"><Loader message="Analyzing data for recommendations..." /></div>;
    }
    
    if (recommendations.length === 0) {
        return <div className="text-center text-on-surface-secondary p-8">No recommendations available. Try regenerating.</div>;
    }

    return (
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className={`rounded-xl shadow-sm p-5 border-l-4 ${priorityClasses[rec.priority]}`}>
            <div className="flex items-start">
              <span className={`material-symbols-outlined text-3xl mr-4 ${iconClasses[rec.priority]}`}>{icons[rec.priority]}</span>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-on-surface">{rec.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityClasses[rec.priority]}`}>{rec.priority} Priority</span>
                </div>
                <p className="text-on-surface-secondary">{rec.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (dataLoading) {
    return <div className="flex justify-center items-center h-full"><Loader message="Loading farm data..." /></div>;
  }

  if (dataError) {
    return <div className="text-red-500 text-center p-4">{dataError}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-on-surface">AI-Powered Recommendations</h1>
        <button
          onClick={regenerateRecommendations}
          disabled={recommendationsLoading || dataLoading}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark disabled:bg-gray-400 transition-colors min-w-[170px]"
        >
          {recommendationsLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Regenerating...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2">refresh</span>
              <span>Regenerate</span>
            </>
          )}
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default RecommendationsPage;