import { FieldMapping } from '../types';

interface SchemaConnectionProps {
  mapping: FieldMapping;
  sourceElement: HTMLElement | null;
  targetElement: HTMLElement | null;
}

export function SchemaConnection({ sourceElement, targetElement }: SchemaConnectionProps) {
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
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <path
        d={path}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4"
      />
    </svg>
  );
} 