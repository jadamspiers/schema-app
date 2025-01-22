import { useParams, useLocation } from 'react-router-dom';
import JsonAnalyzer from '@/components/JsonAnalyzer';
import { useSource } from '@/components/source/context/SourceContext';
import { Header } from '@/components/layout/Header';
import type { Schema } from '@/components/schema/types';

const SourceJsonPage = () => {
  const { sourceId } = useParams();
  const { sources } = useSource();
  const location = useLocation();
  const selectedSchema = location.state?.selectedSchema as Schema | undefined;
  const source = sources.find(s => s.id === sourceId);

  return (
    <div>
      <Header 
        title="JSON Analysis" 
        sourceName={source?.name} 
        showBack 
      />
      <div className="container mx-auto py-8">
        <JsonAnalyzer initialSchema={selectedSchema} />
      </div>
    </div>
  );
};

export default SourceJsonPage;