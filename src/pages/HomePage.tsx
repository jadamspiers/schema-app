// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileJson, FileCode } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Data Format Analyzer</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/syslog">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-6 w-6" />
                Syslog Analyzer
              </CardTitle>
              <CardDescription>
                Parse and analyze syslog format data with structured visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Supports CEF format, Palo Alto logs, and standard syslog formats
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/json">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-6 w-6" />
                JSON Analyzer
              </CardTitle>
              <CardDescription>
                Visualize and explore JSON data structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interactive JSON explorer with syntax highlighting and path navigation
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;