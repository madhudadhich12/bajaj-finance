import { useState } from 'react';
import { VehicleDashboard } from './components/vehicle-dashboard';
import { AddVehicleForm } from './components/add-vehicle-form';
import { LoginForm } from './components/login-form';

/**
 * Page views for navigation
 */
type PageView = 'dashboard' | 'add';

/**
 * Main App component
 * Handles user authentication and renders the appropriate view.
 */
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');

  const handleLoginSuccess = (): void => {
    setIsAuthenticated(true);
    setCurrentView('dashboard'); // Ensure dashboard is shown after login
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleNavigateToAdd = (): void => {
    setCurrentView('add');
  };

  const handleNavigateToDashboard = (): void => {
    setCurrentView('dashboard');
  };
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // After successful login, always show the VehicleDashboard as the homepage
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                Bajaj Finance
              </h1>
              <p className="text-slate-600 text-sm mt-1">Vehicle Management System</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              {currentView === 'dashboard' && (
                <button
                  type="button"
                  onClick={handleNavigateToAdd}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 active:bg-emerald-700 transition-colors font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Add Vehicle
                </button>
              )}
              {currentView === 'add' && (
                <button
                  type="button"
                  onClick={handleNavigateToDashboard}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-emerald-50 text-emerald-800 rounded-md hover:bg-emerald-100 active:bg-emerald-100 transition-colors font-semibold border border-emerald-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Back to Dashboard
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 active:bg-rose-100 transition-colors font-semibold border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'dashboard' && <VehicleDashboard />}
        {currentView === 'add' && (
          <AddVehicleForm onSuccess={handleNavigateToDashboard} onCancel={handleNavigateToDashboard} />
        )}
      </main>
    </div>
  );
};

export default App;
