import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar/Calendar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorProvider } from './contexts/ErrorContext';
import './App.css';

/**
 * Main application component
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  const [currentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorProvider>
      <div className="app-container min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        {/* App Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Todo Calendar</h1>
          <p className="text-gray-600 mt-2">Manage your tasks with a simple calendar interface</p>
        </header>
        
        {/* Main Content */}
        <main className="max-w-5xl mx-auto">
          <ErrorBoundary fallback={
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p>There was an error loading the calendar. Please try refreshing the page.</p>
            </div>
          }>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Calendar showWeekNumbers={true} />
            )}
          </ErrorBoundary>
        </main>
        
        {/* App Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© {currentYear} Todo Calendar App</p>
        </footer>
      </div>
    </ErrorProvider>
  );
}

export default App;