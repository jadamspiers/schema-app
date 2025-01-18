// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SyslogPage from './pages/SyslogPage';
import JsonPage from './pages/JsonPage';
import { ArrowLeft } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/syslog" element={
            <>
              <nav className="border-b">
                <div className="container mx-auto px-4 py-3">
                  <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>
                </div>
              </nav>
              <SyslogPage />
            </>
          } />
          <Route path="/json" element={
            <>
              <nav className="border-b">
                <div className="container mx-auto px-4 py-3">
                  <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>
                </div>
              </nav>
              <JsonPage />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;