import { useParams } from 'react-router-dom';
import SyslogParser from '@/components/SyslogParser';
import { useSource } from '@/components/source/context/SourceContext';
import { Header } from '@/components/layout/Header';

const SourceSyslogPage = () => {
  const { sourceId } = useParams();
  const { sources } = useSource();
  const source = sources.find(s => s.id === sourceId);

  return (
    <div>
      <Header 
        title="Syslog Analysis" 
        sourceName={source?.name} 
        showBack 
      />
      <div className="container mx-auto py-8">
        <SyslogParser />
      </div>
    </div>
  );
};

export default SourceSyslogPage;