import { FieldMapping } from '../types';
import { Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { TransformationDialog } from './TransformationDialog';

interface SchemaConnectionProps {
  mapping: FieldMapping;
  sourceElement: HTMLElement | null;
  targetElement: HTMLElement | null;
  onDelete: (mapping: FieldMapping) => void;
  pipelineId: string;
  onUpdate: (mapping: FieldMapping) => void;
}

export function SchemaConnection({ 
  mapping, 
  sourceElement, 
  targetElement, 
  onDelete,
  pipelineId,
  onUpdate 
}: SchemaConnectionProps) {
  const [transformOpen, setTransformOpen] = useState(false);
  
  if (!sourceElement || !targetElement) return null;

  const containerElement = sourceElement.closest('.relative');
  if (!containerElement) return null;

  const containerRect = containerElement.getBoundingClientRect();
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  // Calculate positions relative to container
  const startX = sourceRect.right - containerRect.left;
  const startY = sourceRect.top - containerRect.top + sourceRect.height / 2;
  const endX = targetRect.left - containerRect.left;
  const endY = targetRect.top - containerRect.top + targetRect.height / 2;

  const path = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <svg style={{ width: '100%', height: '100%' }}>
        <path
          d={path}
          stroke={mapping.transformation?.type === 'none' ? 'hsl(var(--primary))' : 'hsl(var(--warning))'}
          strokeWidth="2"
          fill="none"
          strokeDasharray="4"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (startX + endX) / 2,
          top: (startY + endY) / 2,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={() => setTransformOpen(true)}
          className="h-6 w-6 rounded-full bg-warning text-warning-foreground hover:bg-warning/90 flex items-center justify-center"
        >
          <Wand2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(mapping)}
          className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <TransformationDialog
        open={transformOpen}
        onOpenChange={setTransformOpen}
        mapping={mapping}
        pipelineId={pipelineId}
        onUpdate={onUpdate}
      />
    </div>
  );
} 