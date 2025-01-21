import { useSource } from '@/components/source/context/SourceContext';
import { CreateSourceDialog } from '@/components/source/components/CreateSourceDialog';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileJson, FileCode, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { sources, loading, error } = useSource();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Data Format Analyzer</h1>
        <CreateSourceDialog />
      </div>

      <div className="grid gap-6">
        {sources.map((source) => (
          <Card key={source.id} className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>{source.name}</CardTitle>
              <CardDescription>{source.description}</CardDescription>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link to={`/source/${source.id}/syslog`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-6 w-6" />
                        Syslog Analysis
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
                <Link to={`/source/${source.id}/json`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-6 w-6" />
                        JSON Analysis
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;