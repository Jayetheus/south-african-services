import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Bell, BookOpen, Calculator, DollarSign, PiggyBank, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Services', path: '/services' },
    { icon: MessageSquare, label: 'Requests', path: '/requests' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Additional features accessible from profile or main menu
  const additionalFeatures = [
    { icon: BookOpen, label: 'Learning', path: '/learning' },
    { icon: Calculator, label: 'Bookkeeping', path: '/bookkeeping' },
    { icon: DollarSign, label: 'Pricing', path: '/pricing' },
    { icon: PiggyBank, label: 'Savings', path: '/savings' },
    { icon: Crown, label: 'Prime', path: '/prime' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;