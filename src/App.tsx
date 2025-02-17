import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/context/AuthContext';
import { SourceProvider } from '@/components/source/context/SourceContext';
import { SchemaProvider } from '@/components/schema/context/SchemaContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import SyslogPage from './pages/SyslogPage';
import JsonPage from './pages/JsonPage';
import SourceSyslogPage from './pages/SourceSyslogPage';
import SourceJsonPage from './pages/SourceJsonPage';
import PipelineEditorPage from './pages/PipelineEditorPage';

function App() {
  return (
    <AuthProvider>
      <SourceProvider>
        <SchemaProvider>
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
                <Route
                  path="/source/:sourceId/pipeline/:pipelineId"
                  element={
                    <ProtectedRoute>
                      <PipelineEditorPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </SchemaProvider>
      </SourceProvider>
    </AuthProvider>
  );
}

export default App;