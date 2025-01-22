import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/context/AuthContext';
import { SourceProvider } from '@/components/source/context/SourceContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import SyslogPage from './pages/SyslogPage';
import JsonPage from './pages/JsonPage';
import SourceSyslogPage from './pages/SourceSyslogPage';
import SourceJsonPage from './pages/SourceJsonPage';

function App() {
  return (
    <AuthProvider>
      <SourceProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/syslog"
                element={
                  <ProtectedRoute>
                    <SyslogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/json"
                element={
                  <ProtectedRoute>
                    <JsonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/source/:sourceId/syslog"
                element={
                  <ProtectedRoute>
                    <SourceSyslogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/source/:sourceId/json"
                element={
                  <ProtectedRoute>
                    <SourceJsonPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </SourceProvider>
    </AuthProvider>
  );
}

export default App;