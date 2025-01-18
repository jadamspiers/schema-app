// src/components/SyslogParser.tsx
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CEFHeader {
  version: string;
  deviceVendor: string;
  deviceProduct: string;
  deviceVersion: string;
  signatureId: string;
  name: string;
  severity: string;
}

interface ParsedSyslog {
  priority?: number;
  timestamp: string;
  hostname: string;
  streamData?: {
    [key: string]: string;
  };
  cef?: {
    header: CEFHeader;
    extensions: {
      [key: string]: string;
    };
  };
  rawMessage: string;
}

const SyslogParser = () => {
  const [rawLog, setRawLog] = useState('');
  const [parsedLog, setParsedLog] = useState<ParsedSyslog | null>(null);

  const parsePriority = (log: string): { priority?: number; rest: string } => {
    const priorityMatch = log.match(/^<(\d+)>(.*)/);
    if (priorityMatch) {
      return {
        priority: parseInt(priorityMatch[1], 10),
        rest: priorityMatch[2].trim()
      };
    }
    return { rest: log };
  };

  const parseStreamData = (text: string): { [key: string]: string } => {
    const streamData: { [key: string]: string } = {};
    const matches = text.match(/\[([^\]]+)\]/);
    if (matches) {
      matches[1].split(' ').forEach(pair => {
        const [key, value] = pair.split('=');
        if (value) {
          streamData[key] = value.replace(/"/g, '');
        }
      });
    }
    return streamData;
  };

  const parseCEF = (cefString: string): { header: CEFHeader; extensions: { [key: string]: string } } => {
    const cefRegex = /CEF:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|(.*)/;
    const match = cefString.match(cefRegex);
    
    if (!match) {
      throw new Error('Invalid CEF format');
    }

    const [, version, deviceVendor, deviceProduct, deviceVersion, signatureId, name, severity, extensions] = match;

    // Parse extensions
    const extensionsObj: { [key: string]: string } = {};
    const extensionPattern = /(\w+)=((?:[^ ]|(?<== ))+)/g;
    let extensionMatch;
    
    while ((extensionMatch = extensionPattern.exec(extensions)) !== null) {
      extensionsObj[extensionMatch[1]] = extensionMatch[2];
    }

    return {
      header: {
        version,
        deviceVendor,
        deviceProduct,
        deviceVersion,
        signatureId,
        name,
        severity
      },
      extensions: extensionsObj
    };
  };

  const parseSyslog = (logLine: string): ParsedSyslog | null => {
    try {
      // Parse priority
      const { priority, rest } = parsePriority(logLine);
      
      // Parse timestamp and hostname
      const basicMatch = rest.match(/^(\w+\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+(.*)/);
      if (!basicMatch) return null;
      
      const [, timestamp, hostname, remainder] = basicMatch;
      
      // Parse stream data
      const streamData = parseStreamData(remainder);
      
      // Find and parse CEF data
      const cefMatch = remainder.match(/\{(CEF:.*?)\}$/);
      const cef = cefMatch ? parseCEF(cefMatch[1]) : undefined;

      return {
        priority,
        timestamp,
        hostname,
        streamData,
        cef,
        rawMessage: remainder
      };
    } catch (error) {
      console.error('Parsing error:', error);
      return null;
    }
  };

  const handleLogInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setRawLog(input);
    setParsedLog(parseSyslog(input));
  };

  const ColoredSection = ({ label, value, color }: { label: string; value: string | number | undefined; color: string }) => (
    <div className="grid grid-cols-2 gap-2">
      <div className="font-medium">{label}:</div>
      <div className={`${color} font-mono break-all`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Paste your syslog entry here..."
            value={rawLog}
            onChange={handleLogInput}
            className="min-h-[100px] font-mono"
          />
        </CardContent>
      </Card>

      {parsedLog && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Syslog Information */}
            <div className="space-y-2">
              <h3 className="font-semibold">Basic Syslog Information</h3>
              <ColoredSection label="Priority" value={parsedLog.priority} color="text-red-500" />
              <ColoredSection label="Timestamp" value={parsedLog.timestamp} color="text-blue-500" />
              <ColoredSection label="Hostname" value={parsedLog.hostname} color="text-green-500" />
            </div>

            {/* Stream Data */}
            {parsedLog.streamData && Object.keys(parsedLog.streamData).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Stream Data</h3>
                {Object.entries(parsedLog.streamData).map(([key, value]) => (
                  <ColoredSection key={key} label={key} value={value} color="text-purple-500" />
                ))}
              </div>
            )}

            {/* CEF Header */}
            {parsedLog.cef && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold">CEF Header</h3>
                  <ColoredSection label="Version" value={parsedLog.cef.header.version} color="text-yellow-500" />
                  <ColoredSection label="Device Vendor" value={parsedLog.cef.header.deviceVendor} color="text-yellow-500" />
                  <ColoredSection label="Device Product" value={parsedLog.cef.header.deviceProduct} color="text-yellow-500" />
                  <ColoredSection label="Device Version" value={parsedLog.cef.header.deviceVersion} color="text-yellow-500" />
                  <ColoredSection label="Signature ID" value={parsedLog.cef.header.signatureId} color="text-yellow-500" />
                  <ColoredSection label="Name" value={parsedLog.cef.header.name} color="text-yellow-500" />
                  <ColoredSection label="Severity" value={parsedLog.cef.header.severity} color="text-yellow-500" />
                </div>

                {/* CEF Extensions */}
                <div className="space-y-2">
                  <h3 className="font-semibold">CEF Extensions</h3>
                  {Object.entries(parsedLog.cef.extensions).map(([key, value]) => (
                    <ColoredSection key={key} label={key} value={value} color="text-orange-500" />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SyslogParser;