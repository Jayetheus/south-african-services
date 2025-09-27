import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  BookOpen, 
  Calculator, 
  DollarSign, 
  PiggyBank, 
  Crown,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  User,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  isNew?: boolean;
  isPremium?: boolean;
  category: 'learning' | 'business' | 'finance' | 'premium' | 'settings';
}

const ToolsDrawer: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const tools: ToolItem[] = [
    // Learning Tools
    {
      id: 'learning',
      name: 'Learning Hub',
      description: 'Microlearning & AI coaching',
      icon: <BookOpen size={20} />,
      path: '/learning',
      category: 'learning',
      isNew: true
    },
    
    // Business Tools
    {
      id: 'bookkeeping',
      name: 'Bookkeeping',
      description: 'Invoicing & transaction tracking',
      icon: <Calculator size={20} />,
      path: '/bookkeeping',
      category: 'business'
    },
    {
      id: 'pricing',
      name: 'Pricing Tools',
      description: 'Profitability & market analysis',
      icon: <DollarSign size={20} />,
      path: '/pricing',
      category: 'business'
    },
    {
      id: 'savings',
      name: 'Savings & Credit',
      description: 'Goals, Stokvel & credit readiness',
      icon: <PiggyBank size={20} />,
      path: '/savings',
      category: 'finance'
    },
    
    // Premium Features
    {
      id: 'prime',
      name: 'Prime Features',
      description: 'Location alerts & auto-application',
      icon: <Crown size={20} />,
      path: '/prime',
      category: 'premium',
      isPremium: true
    },
    
    // Settings & Profile
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Alerts and updates',
      icon: <Bell size={20} />,
      path: '/notifications',
      category: 'settings'
    },
    {
      id: 'profile',
      name: 'Profile',
      description: 'Account settings & verification',
      icon: <User size={20} />,
      path: '/profile',
      category: 'settings'
    }
  ];

  const handleToolClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning':
        return 'text-blue-600 bg-blue-50';
      case 'business':
        return 'text-green-600 bg-green-50';
      case 'finance':
        return 'text-purple-600 bg-purple-50';
      case 'premium':
        return 'text-yellow-600 bg-yellow-50';
      case 'settings':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return <BookOpen size={16} className="text-blue-500" />;
      case 'business':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'finance':
        return <Target size={16} className="text-purple-500" />;
      case 'premium':
        return <Crown size={16} className="text-yellow-500" />;
      case 'settings':
        return <Settings size={16} className="text-gray-500" />;
      default:
        return <Settings size={16} className="text-gray-500" />;
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, ToolItem[]>);

  const categoryNames = {
    learning: 'Learning',
    business: 'Business Tools',
    finance: 'Finance',
    premium: 'Premium',
    settings: 'Settings'
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        >
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <SheetTitle className="text-left">{user?.name || 'User'}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'provider' ? 'Service Provider' : 'Customer'}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {getCategoryIcon(category)}
                  <span>{categoryNames[category as keyof typeof categoryNames]}</span>
                </div>
                
                <div className="space-y-2">
                  {categoryTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                        {tool.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm group-hover:text-primary">
                            {tool.name}
                          </h3>
                          {tool.isNew && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          {tool.isPremium && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                              <Crown size={10} className="mr-1" />
                              Prime
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
            >
              <Settings size={16} className="mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <HelpCircle size={16} className="mr-3" />
              Help & Support
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ToolsDrawer;
