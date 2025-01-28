import { FieldMapping } from '../types';
import { Trash2 } from 'lucide-react';

interface SchemaConnectionProps {
  mapping: FieldMapping;
  sourceElement: HTMLElement | null;
  targetElement: HTMLElement | null;
  onDelete: (mapping: FieldMapping) => void;
}

export function SchemaConnection({ mapping, sourceElement, targetElement, onDelete }: SchemaConnectionProps) {
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
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4"
        />
      </svg>
      <button
        onClick={() => onDelete(mapping)}
        style={{
          position: 'absolute',
          left: (startX + endX) / 2,
          top: (startY + endY) / 2,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
        }}
        className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
} 