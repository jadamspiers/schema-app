import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  sourceName?: string;
  showBack?: boolean;
}

export function Header({ title, sourceName, showBack = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b">
      <div className="container mx-auto py-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {sourceName && (
              <p className="text-sm text-muted-foreground">Source: {sourceName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}