import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';

const DemoButton: React.FC = () => {
  const { isDemoMode, setDemoMode } = useDemoMode();
  const { user } = useAuth();

  // Don't show demo button if user is already authenticated
  if (user && !isDemoMode) {
    return null;
  }

  const handleDemoToggle = () => {
    setDemoMode(!isDemoMode);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        onClick={handleDemoToggle}
        variant={isDemoMode ? "outline" : "default"}
        className={isDemoMode ? "bg-background border-primary" : "bg-gradient-primary hover:opacity-90"}
      >
        {isDemoMode ? (
          <>
            <ArrowLeft size={16} className="mr-2" />
            Exit Demo
          </>
        ) : (
          <>
            <Play size={16} className="mr-2" />
            Try Demo
          </>
        )}
      </Button>
    </div>
  );
};

export default DemoButton;