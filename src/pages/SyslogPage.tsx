// src/pages/SyslogPage.tsx
import SyslogParser from '@/components/SyslogParser';

const SyslogPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Syslog Analyzer</h1>
      <SyslogParser />
    </div>
  );
};

export default SyslogPage;