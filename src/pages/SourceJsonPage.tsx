import { useParams } from 'react-router-dom';
import JsonAnalyzer from '@/components/JsonAnalyzer';
import { useSource } from '@/components/source/context/SourceContext';
import { Header } from '@/components/layout/Header';

const SourceJsonPage = () => {
  const { sourceId } = useParams();
  const { sources } = useSource();
  const source = sources.find(s => s.id === sourceId);

  return (
    <div>
      <Header 
        title="JSON Analysis" 
        sourceName={source?.name} 
        showBack 
      />
      <div className="container mx-auto py-8">
        <JsonAnalyzer />
      </div>
    </div>
  );
};

export default SourceJsonPage;