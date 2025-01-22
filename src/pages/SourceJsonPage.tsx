import { useParams } from 'react-router-dom';
import JsonAnalyzer from '@/components/JsonAnalyzer';
import { useSource } from '@/components/source/context/SourceContext';

const SourceJsonPage = () => {
  const { sourceId } = useParams();
  const { sources } = useSource();
  const source = sources.find(s => s.id === sourceId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        JSON Analysis for {source?.name || 'Unknown Source'}
      </h1>
      <JsonAnalyzer />
    </div>
  );
};

export default SourceJsonPage;