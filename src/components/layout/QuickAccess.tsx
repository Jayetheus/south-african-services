import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BookOpen, 
  Calculator, 
  DollarSign, 
  PiggyBank, 
  Crown,
  Bell,
  X,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const QuickAccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'learning',
      name: 'Learning',
      icon: <BookOpen size={20} />,
      path: '/learning',
      color: 'bg-blue-500',
      isNew: true
    },
    {
      id: 'bookkeeping',
      name: 'Bookkeeping',
      icon: <Calculator size={20} />,
      path: '/bookkeeping',
      color: 'bg-green-500'
    },
    {
      id: 'pricing',
      name: 'Pricing',
      icon: <DollarSign size={20} />,
      path: '/pricing',
      color: 'bg-purple-500'
    },
    {
      id: 'savings',
      name: 'Savings',
      icon: <PiggyBank size={20} />,
      path: '/savings',
      color: 'bg-orange-500'
    },
    {
      id: 'prime',
      name: 'Prime',
      icon: <Crown size={20} />,
      path: '/prime',
      color: 'bg-yellow-500',
      isPremium: true
    },
    {
      id: 'notifications',
      name: 'Alerts',
      icon: <Bell size={20} />,
      path: '/notifications',
      color: 'bg-red-500'
    }
  ];

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setIsOpen(true);
    } else if (isRightSwipe && isOpen) {
      setIsOpen(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setIsOpen(!isOpen);
            break;
          case 'l':
            e.preventDefault();
            navigate('/learning');
            break;
          case 'b':
            e.preventDefault();
            navigate('/bookkeeping');
            break;
          case 'p':
            e.preventDefault();
            navigate('/pricing');
            break;
          case 's':
            e.preventDefault();
            navigate('/savings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, navigate]);

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Touch gesture area */}
      <div
        className="fixed left-0 top-0 w-4 h-full z-30"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </Button>
      </div>

      {/* Quick Actions Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Quick Access</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action.path)}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group relative"
                >
                  {action.isNew && (
                    <Badge className="absolute -top-1 -right-1 text-xs bg-red-500">
                      New
                    </Badge>
                  )}
                  {action.isPremium && (
                    <Badge className="absolute -top-1 -right-1 text-xs bg-yellow-500">
                      <Crown size={8} className="mr-1" />
                      Prime
                    </Badge>
                  )}
                  
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  
                  <span className="text-xs font-medium text-center group-hover:text-primary">
                    {action.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Keyboard shortcut hint */}
            <div className="mt-6 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap size={14} />
                <span>Tip: Use Ctrl+K to open quick access</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickAccess;
