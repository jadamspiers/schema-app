import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileJson, FileCode, Loader2, Trash2, GitBranch } from 'lucide-react';
import { useSource } from '@/components/source/context/SourceContext';
import { useSchema } from '@/components/schema/hooks/useSchema';
import { CreateSourceDialog } from '@/components/source/components/CreateSourceDialog';
import { CreatePipelineDialog } from '@/components/source/components/CreatePipelineDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteSourceDialog } from '@/components/source/components/DeleteSourceDialog';
import type { Source } from '@/components/source/types';
import { FieldTransformation } from '@/components/pipeline/types';
import { DeletePipelineDialog } from '@/components/pipeline/components/DeletePipelineDialog';

export interface Pipeline {
  id: string;
  name: string;
  version: string;
  source_id: string;
  created_at: string;
  updated_at: string;
  schema_order?: string[];
  is_latest: boolean;
  source_json?: Record<string, unknown>;
}

export interface FieldMapping {
  sourceSchemaId: string;
  sourceFieldId: string;
  targetSchemaId: string;
  targetFieldId: string;
  transformation?: FieldTransformation;
  sourceType: 'json' | 'schema';
  sourceReference: string;
}

const HomePage = () => {
  const { sources, loading: sourcesLoading } = useSource();
  const { refreshSchemas } = useSchema();
  const navigate = useNavigate();
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);
  
  useEffect(() => {
    const pipelineIds = sources.flatMap(s => s.pipelines?.map(p => p.id) || [ ]);
    if (pipelineIds.length > 0) {
      refreshSchemas(pipelineIds);
    }
  }, [sources, refreshSchemas]);

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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{source.name}</CardTitle>
                  <CardDescription>{source.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <CreatePipelineDialog 
                    sourceId={source.id} 
                    existingSchemas={[]} 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSourceToDelete(source)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Pipelines</h3>
                  <CreatePipelineDialog sourceId={source.id} existingSchemas={[]} />
                </div>
                {source.pipelines && source.pipelines.length > 0 ? (
                  <div className="space-y-2">
                    {source.pipelines.map(pipeline => (
                      <div
                        key={pipeline.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-muted/50 hover:bg-muted group"
                      >
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                          onClick={() => navigate(`/source/${source.id}/pipeline/${pipeline.id}`)}
                        >
                          <GitBranch className="h-4 w-4" />
                          <span className="text-sm font-medium">{pipeline.name}</span>
                          <span className="text-sm text-muted-foreground">v{pipeline.version}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPipelineToDelete(pipeline)}
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-2">
                    No pipelines created yet
                  </div>
                )}
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

      {sourceToDelete && (
        <DeleteSourceDialog
          sourceId={sourceToDelete.id}
          sourceName={sourceToDelete.name}
          open={!!sourceToDelete}
          onOpenChange={(open) => !open && setSourceToDelete(null)}
        />
      )}

      {pipelineToDelete && (
        <DeletePipelineDialog
          pipeline={pipelineToDelete}
          open={!!pipelineToDelete}
          onOpenChange={(open) => !open && setPipelineToDelete(null)}
        />
      )}
    </div>
  );
};

export default HomePage;