// src/pages/JsonPage.tsx
import JsonAnalyzer from '@/components/JsonAnalyzer';

const JsonPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">JSON Analyzer</h1>
      <JsonAnalyzer />
    </div>
  );
};

export default JsonPage;