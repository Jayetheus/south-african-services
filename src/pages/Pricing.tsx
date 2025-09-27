import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Target,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface PricingAnalysis {
  serviceName: string;
  currentPrice: number;
  recommendedPrice: number;
  marketAverage: number;
  profitMargin: number;
  competitiveness: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface CostBreakdown {
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  totalCost: number;
  profitMargin: number;
  finalPrice: number;
}

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calculator');
  const [isLoading, setIsLoading] = useState(false);
  
  const [pricingData, setPricingData] = useState({
    serviceType: '',
    laborHours: '',
    hourlyRate: '',
    materialCost: '',
    overheadPercentage: '20',
    desiredProfit: '30'
  });

  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  const serviceTypes = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Gardening',
    'Painting',
    'Carpentry',
    'HVAC',
    'General Maintenance'
  ];

  const calculatePricing = () => {
    const laborHours = parseFloat(pricingData.laborHours) || 0;
    const hourlyRate = parseFloat(pricingData.hourlyRate) || 0;
    const materialCost = parseFloat(pricingData.materialCost) || 0;
    const overheadPercentage = parseFloat(pricingData.overheadPercentage) || 0;
    const desiredProfit = parseFloat(pricingData.desiredProfit) || 0;

    const laborCost = laborHours * hourlyRate;
    const overheadCost = (laborCost + materialCost) * (overheadPercentage / 100);
    const totalCost = laborCost + materialCost + overheadCost;
    const profitAmount = totalCost * (desiredProfit / 100);
    const finalPrice = totalCost + profitAmount;
    const actualProfitMargin = (profitAmount / finalPrice) * 100;

    const breakdown: CostBreakdown = {
      laborCost,
      materialCost,
      overheadCost,
      totalCost,
      profitMargin: actualProfitMargin,
      finalPrice
    };

    setCostBreakdown(breakdown);
  };

  const analyzePricing = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call for market analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAnalysis: PricingAnalysis = {
        serviceName: pricingData.serviceType,
        currentPrice: costBreakdown?.finalPrice || 0,
        recommendedPrice: (costBreakdown?.finalPrice || 0) * 1.15, // 15% higher
        marketAverage: (costBreakdown?.finalPrice || 0) * 0.9, // 10% lower
        profitMargin: costBreakdown?.profitMargin || 0,
        competitiveness: costBreakdown?.profitMargin && costBreakdown.profitMargin > 25 ? 'high' : 
                        costBreakdown?.profitMargin && costBreakdown.profitMargin > 15 ? 'medium' : 'low',
        suggestions: [
          'Consider offering package deals for multiple services',
          'Implement seasonal pricing adjustments',
          'Add value-added services to justify higher prices',
          'Monitor competitor pricing monthly',
          'Offer discounts for repeat customers'
        ]
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing pricing:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze pricing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCompetitivenessIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'medium':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'low':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={24} />
            <h1 className="text-2xl font-bold">Pricing & Profitability</h1>
          </div>
          <p className="text-white/90 text-sm">
            Optimize your pricing strategy and maximize profitability
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Pricing Calculator</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          </TabsList>

          {/* Pricing Calculator Tab */}
          <TabsContent value="calculator" className="space-y-4">
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Service Pricing Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={pricingData.serviceType}
                    onValueChange={(value) => setPricingData(prev => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="laborHours">Labor Hours</Label>
                    <Input
                      id="laborHours"
                      type="number"
                      value={pricingData.laborHours}
                      onChange={(e) => setPricingData(prev => ({ ...prev, laborHours: e.target.value }))}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (R)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={pricingData.hourlyRate}
                      onChange={(e) => setPricingData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="150"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materialCost">Material Cost (R)</Label>
                  <Input
                    id="materialCost"
                    type="number"
                    value={pricingData.materialCost}
                    onChange={(e) => setPricingData(prev => ({ ...prev, materialCost: e.target.value }))}
                    placeholder="50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overheadPercentage">Overhead %</Label>
                    <Input
                      id="overheadPercentage"
                      type="number"
                      value={pricingData.overheadPercentage}
                      onChange={(e) => setPricingData(prev => ({ ...prev, overheadPercentage: e.target.value }))}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredProfit">Desired Profit %</Label>
                    <Input
                      id="desiredProfit"
                      type="number"
                      value={pricingData.desiredProfit}
                      onChange={(e) => setPricingData(prev => ({ ...prev, desiredProfit: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculatePricing}
                  className="w-full bg-gradient-primary"
                  disabled={!pricingData.serviceType || !pricingData.laborHours || !pricingData.hourlyRate}
                >
                  <Calculator size={16} className="mr-2" />
                  Calculate Pricing
                </Button>
              </CardContent>
            </Card>

            {/* Cost Breakdown Results */}
            {costBreakdown && (
              <Card className="border-0 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor Cost:</span>
                      <span className="font-medium">R{costBreakdown.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material Cost:</span>
                      <span className="font-medium">R{costBreakdown.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overhead Cost:</span>
                      <span className="font-medium">R{costBreakdown.overheadCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">R{costBreakdown.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Margin:</span>
                        <span className="font-medium">{costBreakdown.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 bg-primary/10 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Recommended Price:</span>
                        <span className="font-bold text-lg text-primary">R{costBreakdown.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get insights on your pricing competitiveness and market positioning.
                </p>
                <Button
                  onClick={analyzePricing}
                  disabled={!costBreakdown}
                  className="w-full bg-gradient-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={16} className="mr-2" />
                      Analyze Pricing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-4">
                <Card className="border-0 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">R{analysis.currentPrice.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Your Price</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">R{analysis.marketAverage.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Market Average</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getCompetitivenessIcon(analysis.competitiveness)}
                        <span className="font-medium">Competitiveness</span>
                      </div>
                      <Badge className={`text-xs ${getCompetitivenessColor(analysis.competitiveness)}`}>
                        {analysis.competitiveness}
                      </Badge>
                    </div>

                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">R{analysis.recommendedPrice.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Recommended Price</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb size={20} />
                      Pricing Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Pricing;
