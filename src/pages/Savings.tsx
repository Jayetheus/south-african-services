import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PiggyBank, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Calculator,
  Users,
  Loader2,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'business' | 'personal' | 'emergency' | 'equipment';
  isCompleted: boolean;
  createdAt: string;
}

interface StokvelGroup {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  nextContribution: string;
  isActive: boolean;
}

interface CreditReadiness {
  score: number;
  factors: {
    incomeStability: number;
    savingsHistory: number;
    debtToIncome: number;
    businessRegistration: boolean;
    taxCompliance: boolean;
  };
  recommendations: string[];
  nextSteps: string[];
}

const Savings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showStokvelModal, setShowStokvelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [stokvelGroups, setStokvelGroups] = useState<StokvelGroup[]>([]);
  const [creditReadiness, setCreditReadiness] = useState<CreditReadiness | null>(null);

  const [goalData, setGoalData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'business' as 'business' | 'personal' | 'emergency' | 'equipment'
  });

  const [stokvelData, setStokvelData] = useState({
    name: '',
    contributionAmount: '',
    frequency: 'monthly' as 'weekly' | 'monthly',
    totalMembers: '',
    totalCycles: ''
  });

  // Load savings data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGoals: SavingsGoal[] = [
          {
            id: '1',
            name: 'New Equipment Fund',
            targetAmount: 15000,
            currentAmount: 8500,
            targetDate: '2024-06-01',
            category: 'equipment',
            isCompleted: false,
            createdAt: '2024-01-01'
          },
          {
            id: '2',
            name: 'Emergency Fund',
            targetAmount: 5000,
            currentAmount: 5000,
            targetDate: '2024-03-01',
            category: 'emergency',
            isCompleted: true,
            createdAt: '2023-12-01'
          },
          {
            id: '3',
            name: 'Business Expansion',
            targetAmount: 25000,
            currentAmount: 12000,
            targetDate: '2024-12-01',
            category: 'business',
            isCompleted: false,
            createdAt: '2024-01-15'
          }
        ];

        const mockStokvels: StokvelGroup[] = [
          {
            id: '1',
            name: 'Cape Town Service Providers',
            contributionAmount: 500,
            frequency: 'monthly',
            totalMembers: 12,
            currentCycle: 3,
            totalCycles: 12,
            nextContribution: '2024-02-01',
            isActive: true
          },
          {
            id: '2',
            name: 'Plumbers United',
            contributionAmount: 300,
            frequency: 'weekly',
            totalMembers: 8,
            currentCycle: 8,
            totalCycles: 52,
            nextContribution: '2024-01-22',
            isActive: true
          }
        ];

        const mockCreditReadiness: CreditReadiness = {
          score: 75,
          factors: {
            incomeStability: 80,
            savingsHistory: 70,
            debtToIncome: 85,
            businessRegistration: true,
            taxCompliance: true
          },
          recommendations: [
            'Maintain consistent monthly savings',
            'Keep business registration up to date',
            'Continue building emergency fund',
            'Consider formalizing business structure'
          ],
          nextSteps: [
            'Apply for business credit card',
            'Register for VAT if applicable',
            'Build relationship with local bank',
            'Document all business transactions'
          ]
        };
        
        setSavingsGoals(mockGoals);
        setStokvelGroups(mockStokvels);
        setCreditReadiness(mockCreditReadiness);
      } catch (error) {
        console.error('Error loading savings data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load savings data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  const handleCreateGoal = async () => {
    try {
      setIsSubmitting(true);
      
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        name: goalData.name,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: 0,
        targetDate: goalData.targetDate,
        category: goalData.category,
        isCompleted: false,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setSavingsGoals(prev => [newGoal, ...prev]);
      setShowGoalModal(false);
      setGoalData({
        name: '',
        targetAmount: '',
        targetDate: '',
        category: 'business'
      });
      
      toast({
        title: 'Goal created',
        description: 'Your savings goal has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error creating goal',
        description: 'Failed to create savings goal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinStokvel = async () => {
    try {
      setIsSubmitting(true);
      
      const newStokvel: StokvelGroup = {
        id: Date.now().toString(),
        name: stokvelData.name,
        contributionAmount: parseFloat(stokvelData.contributionAmount),
        frequency: stokvelData.frequency,
        totalMembers: parseInt(stokvelData.totalMembers),
        currentCycle: 1,
        totalCycles: parseInt(stokvelData.totalCycles),
        nextContribution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true
      };

      setStokvelGroups(prev => [newStokvel, ...prev]);
      setShowStokvelModal(false);
      setStokvelData({
        name: '',
        contributionAmount: '',
        frequency: 'monthly',
        totalMembers: '',
        totalCycles: ''
      });
      
      toast({
        title: 'Stokvel joined',
        description: 'You have successfully joined the Stokvel group.',
      });
    } catch (error) {
      console.error('Error joining stokvel:', error);
      toast({
        title: 'Error joining stokvel',
        description: 'Failed to join Stokvel group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return <TrendingUp size={16} className="text-blue-500" />;
      case 'personal':
        return <Target size={16} className="text-green-500" />;
      case 'emergency':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'equipment':
        return <Calculator size={16} className="text-purple-500" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'personal':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'equipment':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <PiggyBank size={24} />
            <h1 className="text-2xl font-bold">Savings & Credit</h1>
          </div>
          
          {/* Savings Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">R{totalSavings.toLocaleString()}</div>
              <div className="text-xs text-white/80">Total Saved</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-white/80">Progress</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{creditReadiness?.score || 0}</div>
              <div className="text-xs text-white/80">Credit Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="stokvel">Stokvel</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Credit Readiness */}
            {creditReadiness && (
              <Card className="border-0 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star size={20} />
                    Credit Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(creditReadiness.score)}`}>
                      {creditReadiness.score}
                    </div>
                    <p className="text-sm text-muted-foreground">Out of 100</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Income Stability</span>
                      <span>{creditReadiness.factors.incomeStability}%</span>
                    </div>
                    <Progress value={creditReadiness.factors.incomeStability} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Savings History</span>
                      <span>{creditReadiness.factors.savingsHistory}%</span>
                    </div>
                    <Progress value={creditReadiness.factors.savingsHistory} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Debt-to-Income Ratio</span>
                      <span>{creditReadiness.factors.debtToIncome}%</span>
                    </div>
                    <Progress value={creditReadiness.factors.debtToIncome} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowGoalModal(true)}
                className="bg-gradient-primary"
              >
                <Target size={16} className="mr-2" />
                New Goal
              </Button>
              <Button
                onClick={() => setShowStokvelModal(true)}
                variant="outline"
              >
                <Users size={16} className="mr-2" />
                Join Stokvel
              </Button>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Savings Goals</h2>
              <Button
                onClick={() => setShowGoalModal(true)}
                size="sm"
                className="bg-gradient-primary"
              >
                <Target size={16} className="mr-2" />
                New Goal
              </Button>
            </div>

            <div className="space-y-3">
              {savingsGoals.map((goal) => (
                <Card key={goal.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(goal.category)}
                        <h3 className="font-medium text-foreground">{goal.name}</h3>
                      </div>
                      <Badge className={`text-xs ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          R{goal.currentAmount.toLocaleString()} / R{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(goal.currentAmount / goal.targetAmount) * 100} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complete</span>
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>
                    
                    {goal.isCompleted && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm text-green-700">Goal completed!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stokvel Tab */}
          <TabsContent value="stokvel" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stokvel Groups</h2>
              <Button
                onClick={() => setShowStokvelModal(true)}
                size="sm"
                className="bg-gradient-primary"
              >
                <Users size={16} className="mr-2" />
                Join Group
              </Button>
            </div>

            <div className="space-y-3">
              {stokvelGroups.map((group) => (
                <Card key={group.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          R{group.contributionAmount} {group.frequency}
                        </p>
                      </div>
                      <Badge className={group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{group.totalMembers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cycle Progress</span>
                        <span className="font-medium">
                          {group.currentCycle} / {group.totalCycles}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Contribution</span>
                        <span className="font-medium">{group.nextContribution}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalData.name}
                onChange={(e) => setGoalData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., New Equipment Fund"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount (R)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={goalData.targetAmount}
                  onChange={(e) => setGoalData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={goalData.targetDate}
                  onChange={(e) => setGoalData(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={goalData.category}
                onValueChange={(value) => setGoalData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowGoalModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGoal}
                disabled={isSubmitting || !goalData.name || !goalData.targetAmount}
                className="flex-1 bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Goal'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Stokvel Modal */}
      <Dialog open={showStokvelModal} onOpenChange={setShowStokvelModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Join Stokvel Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stokvelName">Group Name</Label>
              <Input
                id="stokvelName"
                value={stokvelData.name}
                onChange={(e) => setStokvelData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Cape Town Service Providers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contributionAmount">Contribution (R)</Label>
                <Input
                  id="contributionAmount"
                  type="number"
                  value={stokvelData.contributionAmount}
                  onChange={(e) => setStokvelData(prev => ({ ...prev, contributionAmount: e.target.value }))}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={stokvelData.frequency}
                  onValueChange={(value) => setStokvelData(prev => ({ ...prev, frequency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalMembers">Total Members</Label>
                <Input
                  id="totalMembers"
                  type="number"
                  value={stokvelData.totalMembers}
                  onChange={(e) => setStokvelData(prev => ({ ...prev, totalMembers: e.target.value }))}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalCycles">Total Cycles</Label>
                <Input
                  id="totalCycles"
                  type="number"
                  value={stokvelData.totalCycles}
                  onChange={(e) => setStokvelData(prev => ({ ...prev, totalCycles: e.target.value }))}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStokvelModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinStokvel}
                disabled={isSubmitting || !stokvelData.name || !stokvelData.contributionAmount}
                className="flex-1 bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Group'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Savings;
