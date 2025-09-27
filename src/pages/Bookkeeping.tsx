import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calculator, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Download,
  Send,
  Edit,
  Trash2,
  Calendar,
  User,
  Loader2,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  client?: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const Bookkeeping: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const [transactionData, setTransactionData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    client: ''
  });

  // Load bookkeeping data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'income',
            category: 'Service Payment',
            description: 'Plumbing repair - Kitchen sink',
            amount: 450,
            date: '2024-01-15',
            client: 'John Smith',
            status: 'paid'
          },
          {
            id: '2',
            type: 'expense',
            category: 'Supplies',
            description: 'Pipe fittings and tools',
            amount: 85,
            date: '2024-01-14',
            status: 'paid'
          },
          {
            id: '3',
            type: 'income',
            category: 'Service Payment',
            description: 'Electrical installation',
            amount: 320,
            date: '2024-01-13',
            client: 'Sarah Johnson',
            status: 'paid'
          },
          {
            id: '4',
            type: 'expense',
            category: 'Transportation',
            description: 'Fuel for service calls',
            amount: 45,
            date: '2024-01-12',
            status: 'paid'
          }
        ];

        const mockInvoices: Invoice[] = [
          {
            id: '1',
            clientName: 'Mike Wilson',
            clientEmail: 'mike@email.com',
            amount: 280,
            dueDate: '2024-01-20',
            status: 'sent',
            items: [
              { id: '1-1', description: 'Bathroom renovation', quantity: 1, rate: 280, amount: 280 }
            ],
            createdAt: '2024-01-10'
          },
          {
            id: '2',
            clientName: 'Lisa Brown',
            clientEmail: 'lisa@email.com',
            amount: 150,
            dueDate: '2024-01-18',
            status: 'paid',
            items: [
              { id: '2-1', description: 'Light fixture installation', quantity: 2, rate: 75, amount: 150 }
            ],
            createdAt: '2024-01-08'
          }
        ];
        
        setTransactions(mockTransactions);
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Error loading bookkeeping data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load bookkeeping data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  const handleCreateInvoice = async () => {
    try {
      setIsSubmitting(true);
      
      const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        amount: totalAmount,
        dueDate: invoiceData.dueDate,
        status: 'draft',
        items: invoiceData.items,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setShowInvoiceModal(false);
      setInvoiceData({
        clientName: '',
        clientEmail: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
      
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error creating invoice',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      setIsSubmitting(true);
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: transactionData.type,
        category: transactionData.category,
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date,
        client: transactionData.client || undefined,
        status: 'paid'
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowTransactionModal(false);
      setTransactionData({
        type: 'income',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        client: ''
      });
      
      toast({
        title: 'Transaction recorded',
        description: 'Your transaction has been recorded successfully.',
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error recording transaction',
        description: 'Failed to record transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setInvoiceData(prev => ({ ...prev, items: updatedItems }));
  };

  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Calculator size={24} />
            <h1 className="text-2xl font-bold">Bookkeeping</h1>
          </div>
          
          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">R{totalIncome.toLocaleString()}</div>
              <div className="text-xs text-white/80">Income</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">R{totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-white/80">Expenses</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                R{netProfit.toLocaleString()}
              </div>
              <div className="text-xs text-white/80">Profit</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 bg-card/50">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Receipt size={20} className="text-green-500" />
                  </div>
                  <div className="text-lg font-bold">{pendingInvoices}</div>
                  <div className="text-xs text-muted-foreground">Pending Invoices</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-card/50">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp size={20} className="text-blue-500" />
                  </div>
                  <div className="text-lg font-bold">{transactions.length}</div>
                  <div className="text-xs text-muted-foreground">Total Transactions</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : (
                            <TrendingDown size={16} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowTransactionModal(true)}
                className="bg-gradient-primary"
              >
                <Plus size={16} className="mr-2" />
                Add Transaction
              </Button>
              <Button
                onClick={() => setShowInvoiceModal(true)}
                variant="outline"
              >
                <FileText size={16} className="mr-2" />
                Create Invoice
              </Button>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Transactions</h2>
              <Button
                onClick={() => setShowTransactionModal(true)}
                size="sm"
                className="bg-gradient-primary"
              >
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp size={20} className="text-green-600" />
                          ) : (
                            <TrendingDown size={20} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{transaction.description}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          {transaction.client && (
                            <p className="text-xs text-muted-foreground">Client: {transaction.client}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Invoices</h2>
              <Button
                onClick={() => setShowInvoiceModal(true)}
                size="sm"
                className="bg-gradient-primary"
              >
                <Plus size={16} className="mr-2" />
                Create
              </Button>
            </div>

            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{invoice.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-foreground">R{invoice.amount}</p>
                        <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send size={14} className="mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={transactionData.type}
                  onValueChange={(value) => setTransactionData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={transactionData.category}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Service Payment"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={transactionData.description}
                onChange={(e) => setTransactionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client (Optional)</Label>
              <Input
                id="client"
                value={transactionData.client}
                onChange={(e) => setTransactionData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Client name"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTransactionModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTransaction}
                disabled={isSubmitting || !transactionData.description || !transactionData.amount}
                className="flex-1 bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={invoiceData.clientName}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={invoiceData.clientEmail}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Invoice Items</Label>
              {invoiceData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {invoiceData.items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Qty"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Rate"
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Amount"
                        value={item.amount}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                onClick={addInvoiceItem}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus size={14} className="mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">
                  R{invoiceData.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={isSubmitting || !invoiceData.clientName || !invoiceData.clientEmail}
                className="flex-1 bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
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

export default Bookkeeping;
