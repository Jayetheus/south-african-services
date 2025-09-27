import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Trophy,
  Brain,
  Target,
  TrendingUp,
  Award,
  Loader2,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isCompleted: boolean;
  progress: number; // 0-100
  isPremium: boolean;
  thumbnail: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'practice';
  duration: number;
  isCompleted: boolean;
  content: string;
}

interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

const Learning: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);

  // Mock learning data
  useEffect(() => {
    const loadLearningData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockModules: LearningModule[] = [
          {
            id: '1',
            title: 'Business Fundamentals',
            description: 'Learn the basics of running a successful service business',
            duration: 45,
            difficulty: 'beginner',
            category: 'Business',
            isCompleted: false,
            progress: 60,
            isPremium: false,
            thumbnail: '📚',
            lessons: [
              { id: '1-1', title: 'Setting Your Prices', type: 'video', duration: 10, isCompleted: true, content: 'Learn how to price your services competitively' },
              { id: '1-2', title: 'Customer Service Excellence', type: 'article', duration: 15, isCompleted: true, content: 'Best practices for customer satisfaction' },
              { id: '1-3', title: 'Time Management', type: 'quiz', duration: 20, isCompleted: false, content: 'Test your time management skills' }
            ]
          },
          {
            id: '2',
            title: 'Digital Marketing for Service Providers',
            description: 'Master online marketing to grow your business',
            duration: 90,
            difficulty: 'intermediate',
            category: 'Marketing',
            isCompleted: false,
            progress: 25,
            isPremium: true,
            thumbnail: '📱',
            lessons: [
              { id: '2-1', title: 'Social Media Strategy', type: 'video', duration: 25, isCompleted: true, content: 'Build your social media presence' },
              { id: '2-2', title: 'Online Reviews Management', type: 'article', duration: 20, isCompleted: false, content: 'How to handle and leverage reviews' },
              { id: '2-3', title: 'SEO for Local Business', type: 'practice', duration: 45, isCompleted: false, content: 'Improve your local search visibility' }
            ]
          },
          {
            id: '3',
            title: 'Financial Management',
            description: 'Learn bookkeeping, invoicing, and financial planning',
            duration: 120,
            difficulty: 'intermediate',
            category: 'Finance',
            isCompleted: false,
            progress: 0,
            isPremium: true,
            thumbnail: '💰',
            lessons: [
              { id: '3-1', title: 'Basic Bookkeeping', type: 'video', duration: 30, isCompleted: false, content: 'Track your income and expenses' },
              { id: '3-2', title: 'Creating Professional Invoices', type: 'practice', duration: 25, isCompleted: false, content: 'Design and send invoices' },
              { id: '3-3', title: 'Tax Preparation', type: 'article', duration: 35, isCompleted: false, content: 'Prepare for tax season' },
              { id: '3-4', title: 'Financial Planning', type: 'quiz', duration: 30, isCompleted: false, content: 'Plan for business growth' }
            ]
          },
          {
            id: '4',
            title: 'Advanced Service Techniques',
            description: 'Master advanced techniques for your specific trade',
            duration: 150,
            difficulty: 'advanced',
            category: 'Skills',
            isCompleted: true,
            progress: 100,
            isPremium: false,
            thumbnail: '🔧',
            lessons: [
              { id: '4-1', title: 'Safety Protocols', type: 'video', duration: 40, isCompleted: true, content: 'Essential safety practices' },
              { id: '4-2', title: 'Quality Control', type: 'article', duration: 30, isCompleted: true, content: 'Maintain high service standards' },
              { id: '4-3', title: 'Problem Solving', type: 'practice', duration: 50, isCompleted: true, content: 'Handle complex challenges' },
              { id: '4-4', title: 'Final Assessment', type: 'quiz', duration: 30, isCompleted: true, content: 'Test your knowledge' }
            ]
          }
        ];

        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'tip',
            title: 'Pricing Optimization',
            message: 'Based on your recent jobs, consider increasing your hourly rate by 15% to match market standards.',
            action: 'Update Pricing',
            priority: 'medium'
          },
          {
            id: '2',
            type: 'achievement',
            title: 'Learning Streak',
            message: 'Great job! You\'ve completed 3 modules this week. Keep up the momentum!',
            priority: 'low'
          },
          {
            id: '3',
            type: 'suggestion',
            title: 'Skill Gap Identified',
            message: 'Consider learning about digital marketing to reach more customers in your area.',
            action: 'Start Learning',
            priority: 'high'
          },
          {
            id: '4',
            type: 'warning',
            title: 'Incomplete Profile',
            message: 'Complete your verification to access premium learning modules.',
            action: 'Complete Profile',
            priority: 'high'
          }
        ];
        
        setModules(mockModules);
        setAiInsights(mockInsights);
      } catch (error) {
        console.error('Error loading learning data:', error);
        toast({
          title: 'Error loading content',
          description: 'Failed to load learning modules. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLearningData();
  }, [toast]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Brain size={16} className="text-blue-500" />;
      case 'warning':
        return <Target size={16} className="text-red-500" />;
      case 'achievement':
        return <Trophy size={16} className="text-yellow-500" />;
      case 'suggestion':
        return <TrendingUp size={16} className="text-green-500" />;
      default:
        return <Brain size={16} className="text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'warning':
        return 'border-l-red-500 bg-red-50/50';
      case 'achievement':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'suggestion':
        return 'border-l-green-500 bg-green-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const startModule = (module: LearningModule) => {
    if (module.isPremium && !user?.is_verified) {
      toast({
        title: 'Premium Content',
        description: 'Complete your verification to access premium learning modules.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedModule(module);
  };

  const completedModules = modules.filter(m => m.isCompleted).length;
  const totalProgress = modules.reduce((sum, m) => sum + m.progress, 0) / modules.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={24} />
            <h1 className="text-2xl font-bold">Learning Hub</h1>
          </div>
          
          {/* Learning Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{completedModules}</div>
              <div className="text-xs text-white/80">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{Math.round(totalProgress)}%</div>
              <div className="text-xs text-white/80">Progress</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">7</div>
              <div className="text-xs text-white/80">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Learning Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-2 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((module) => (
                  <Card key={module.id} className="border-0 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{module.thumbnail}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-foreground mb-1">
                                {module.title}
                                {module.isPremium && (
                                  <Lock size={14} className="inline ml-2 text-yellow-500" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {module.description}
                              </p>
                            </div>
                            <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                              {module.difficulty}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{module.duration} min</span>
                              <span>{module.progress}% complete</span>
                            </div>
                            <Progress value={module.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{module.lessons.length} lessons</span>
                            </div>
                            <Button
                              onClick={() => startModule(module)}
                              size="sm"
                              disabled={module.isPremium && !user?.is_verified}
                              className="bg-gradient-primary"
                            >
                              {module.isCompleted ? (
                                <>
                                  <CheckCircle size={14} className="mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Play size={14} className="mr-1" />
                                  {module.progress > 0 ? 'Continue' : 'Start'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className={`border-0 bg-card/50 border-l-4 ${getInsightColor(insight.type)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.message}
                        </p>
                        {insight.action && (
                          <Button size="sm" variant="outline" className="text-xs">
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Learning;
