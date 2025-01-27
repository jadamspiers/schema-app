import { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileJson, FileCode, ScrollText, Loader2, Plus } from 'lucide-react';
import { useSource } from '@/components/source/context/SourceContext';
import { useSchema } from '@/components/schema/hooks/useSchema';
import { CreateSourceDialog } from '@/components/source/components/CreateSourceDialog';
import { CreatePipelineDialog } from '@/components/source/components/CreatePipelineDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Schema } from '@/components/schema/types';

const HomePage = () => {
  const { sources, loading: sourcesLoading } = useSource();
  const { schemasByPipeline, refreshSchemas } = useSchema();
  const navigate = useNavigate();
  
  const handleSchemaClick = (pipelineId: string, schema: Schema) => {
    const source = sources.find(s => 
      s.pipelines?.some(p => p.id === pipelineId)
    );
    if (!source) return;
    
    navigate(`/source/${source.id}/json`, { 
      state: { selectedSchema: schema } 
    });
  };

  const memoizedRefreshSchemas = useCallback(refreshSchemas, []);

  useEffect(() => {
    const pipelineIds = sources.flatMap(s => s.pipelines?.map(p => p.id) || []);
    if (pipelineIds.length > 0) {
      memoizedRefreshSchemas(pipelineIds);
    }
  }, [sources, memoizedRefreshSchemas]);

  if (sourcesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-4">
                {source.pipelines?.map(pipeline => (
                  <div key={pipeline.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{pipeline.name}</h3>
                      <div className="flex items-center gap-2">
                        <CreatePipelineDialog 
                          sourceId={source.id} 
                          existingSchemas={schemasByPipeline[pipeline.id] || []}
                        />
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Schema
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {schemasByPipeline[pipeline.id]?.map(schema => (
                        <div
                          key={schema.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50 cursor-pointer hover:bg-muted"
                          onClick={() => handleSchemaClick(pipeline.id, schema)}
                        >
                          <div className="flex items-center gap-2">
                            <ScrollText className="h-4 w-4" />
                            <span className="text-sm">{schema.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">v{schema.version}</span>
                        </div>
                      ))}
                      {!schemasByPipeline[pipeline.id]?.length && (
                        <div className="text-sm text-muted-foreground p-2">
                          No schemas saved yet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sources.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No sources added yet. Click "New Source" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;