import { useParams } from 'react-router-dom';
import SyslogParser from '@/components/SyslogParser';
import { useSource } from '@/components/source/context/SourceContext';

const SourceSyslogPage = () => {
  const { sourceId } = useParams();
  const { sources } = useSource();
  const source = sources.find(s => s.id === sourceId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Syslog Analysis for {source?.name || 'Unknown Source'}
      </h1>
      <SyslogParser />
    </div>
  );
};

export default SourceSyslogPage;