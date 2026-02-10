import { JSX, useState } from 'react';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

/**
 * Login Form component for user authentication.
 * Uses hardcoded credentials for demonstration purposes.
 */
export const LoginForm = ({ onLoginSuccess }: LoginFormProps): JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const HARDCODED_USERNAME = 'admin';
  const HARDCODED_PASSWORD = '123456';

  /**
   * Handles the login form submission.
   * Validates hardcoded credentials and calls onLoginSuccess on success.
   * @param event - The form submission event
   */
  const handleLogin = (event: React.FormEvent): void => {
    event.preventDefault();
    setLoginError('');

    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      onLoginSuccess();
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-8 sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to manage your vehicle portfolio.
            </p>
            {/* <p className="mt-3 text-xs text-slate-500">
              Demo credentials: <span className="font-semibold text-slate-700">admin / 123456</span>
            </p> */}
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-slate-700 text-sm font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-slate-700 text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {loginError && (
              <div
                className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-lg text-sm text-center"
                role="alert"
              >
                <span className="block sm:inline">{loginError}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
