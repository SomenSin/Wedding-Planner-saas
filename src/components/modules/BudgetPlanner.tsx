import React, { useMemo, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { Input } from '../ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
}

interface BudgetPlannerProps {
  totalBudget: number;
  budgetItems: BudgetItem[];
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateTotalBudget: (newBudget: number) => void;
  currency: string;
  onUpdateCurrency: (newCurrency: string) => void;
  userId: string;
  refreshData: () => void;
}

const COLORS = [
  '#18181b', // Zinc 900
  '#c5a880', // Champagne Gold
  '#e2c2c6', // Blush Pink
  '#8a9a86', // Sage Green
  '#a0aba5', // Dusty Blue/Gray
  '#e8e4e1', // Warm Linen
  '#52525b'  // Zinc 600
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  totalBudget,
  budgetItems,
  onUpdateItem,
  onDeleteItem,
  onUpdateTotalBudget,
  currency,
  onUpdateCurrency,
  userId,
  refreshData
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [newItem, setNewItem] = useState({
    category: '',
    item_name: '',
    estimated_cost: 0,
    actual_cost: 0,
    is_paid: false
  });

  const stats = useMemo(() => {
    const totalEstimated = budgetItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0);
    const remaining = totalBudget - totalActual;
    const overBudget = totalActual > totalBudget;

    return {
      totalEstimated,
      totalActual,
      remaining,
      overBudget,
      percentSpent: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0
    };
  }, [totalBudget, budgetItems]);

  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    budgetItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + (item.actual_cost || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [budgetItems]);

  const barData = useMemo(() => {
    return budgetItems.slice(0, 6).map(item => ({
      name: item.category,
      estimated: item.estimated_cost || 0,
      actual: item.actual_cost || 0
    }));
  }, [budgetItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveBudget = () => {
    onUpdateTotalBudget(tempBudget);
    setIsEditingBudget(false);
  };

  const handleAddExpense = async () => {
    if (!newItem.category) {
      toast.error('Please enter a category');
      return;
    }

    const { data, error } = await supabase
      .from('budget_items')
      .insert([{
        category: newItem.category,
        item_name: newItem.item_name || 'Expense',
        estimated_cost: newItem.estimated_cost,
        actual_cost: newItem.actual_cost,
        is_paid: newItem.is_paid,
        couple_id: userId
      }])
      .select();

    if (error) {
      toast.error('Failed to add expense');
    } else {
      toast.success('Expense added');
      setIsAddDialogOpen(false);
      setNewItem({ category: '', item_name: '', estimated_cost: 0, actual_cost: 0, is_paid: false });
      refreshData();
    }
  };

  const handleEditExpense = () => {
    if (!editingItem) return;
    if (!editingItem.category) {
      toast.error('Please enter a category');
      return;
    }
    
    onUpdateItem(editingItem.id, {
      category: editingItem.category,
      item_name: editingItem.item_name,
      estimated_cost: editingItem.estimated_cost,
      actual_cost: editingItem.actual_cost,
      is_paid: editingItem.is_paid
    });
    
    toast.success('Expense updated');
    setEditingItem(null);
  };

  const handleExport = () => {
    if (budgetItems.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    
    const headers = ['Category,Expense Name,Estimated Cost,Actual Cost,Status'];
    const rows = budgetItems.map(item => {
      const isOver = item.actual_cost > item.estimated_cost;
      const status = isOver ? 'Over Budget' : 'On Track';
      return `"${item.category || ''}","${item.item_name || ''}","${item.estimated_cost || 0}","${item.actual_cost || 0}","${status}"`;
    });
    const csvContent = headers.concat(rows).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "budget-ledger.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Budget exported successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Header with Currency Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-zinc-900 dark:text-white">Financial Hub</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Track your wedding investment and expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-xs uppercase tracking-widest font-bold text-zinc-400">Currency</Label>
          <Select value={currency} onValueChange={onUpdateCurrency}>
            <SelectTrigger className="w-[180px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 dark:text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
              {CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code} className="dark:text-white dark:focus:bg-zinc-800">
                  {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none bg-zinc-900 dark:bg-zinc-950 p-2 text-white shadow-xl border dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Budget</CardTitle>
              <div className="rounded-xl bg-zinc-800 p-2">
                <DollarSign className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="0"
                  value={tempBudget === 0 ? '' : tempBudget} 
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                />
                <Button size="icon" variant="ghost" onClick={handleSaveBudget} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingBudget(false)} className="text-red-400 hover:text-red-300">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-3xl font-serif italic text-white">{formatCurrency(totalBudget)}</div>
                <Button size="icon" variant="ghost" onClick={() => { setTempBudget(totalBudget); setIsEditingBudget(true); }} className="text-zinc-500 hover:text-white">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div 
                className={`h-full transition-all duration-500 ${stats.overBudget ? 'bg-red-500' : 'bg-white'}`} 
                style={{ width: `${Math.min(stats.percentSpent, 100)}%` }} 
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{Math.round(stats.percentSpent)}% of budget allocated</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Actual Spent</CardTitle>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-2">
                <TrendingUp className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif italic text-zinc-900 dark:text-white">{formatCurrency(stats.totalActual)}</div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                <ArrowUpRight className="h-3 w-3" />
                {formatCurrency(stats.totalActual - stats.totalEstimated)}
              </span>
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider">vs Estimated</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Remaining</CardTitle>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-2">
                <AlertCircle className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-serif italic ${stats.overBudget ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
              {formatCurrency(stats.remaining)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-0.5 font-medium ${stats.overBudget ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {stats.overBudget ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(Math.round(100 - stats.percentSpent))}%
              </span>
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider">of total budget</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">Spending by Category</CardTitle>
            <CardDescription className="dark:text-zinc-400">Distribution of actual costs across categories.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[400px]">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-4 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{formatCurrency(stats.totalEstimated)}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Total Estimated</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{formatCurrency(stats.totalActual)}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Total Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">Estimated vs Actual</CardTitle>
            <CardDescription className="dark:text-zinc-400">Comparison of planned budget and real expenses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="estimated" fill="#d4d4d8" radius={[0, 4, 4, 0]} barSize={12} name="Estimated" />
                <Bar dataKey="actual" fill="#18181b" radius={[0, 4, 4, 0]} barSize={12} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div>
            <CardTitle className="dark:text-white">Budget Ledger</CardTitle>
            <CardDescription className="dark:text-zinc-400">Detailed breakdown of all wedding expenses.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:text-white" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>} />
              <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="font-serif italic text-2xl dark:text-white">Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="dark:text-zinc-300">Category</Label>
                    <Input 
                      placeholder="e.g. Venue, Catering, Flowers" 
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-zinc-300">Estimated Cost ({currency})</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newItem.estimated_cost === 0 ? '' : newItem.estimated_cost}
                        onChange={(e) => setNewItem({ ...newItem, estimated_cost: Number(e.target.value) })}
                        className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-zinc-300">Actual Cost ({currency})</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newItem.actual_cost === 0 ? '' : newItem.actual_cost}
                        onChange={(e) => setNewItem({ ...newItem, actual_cost: Number(e.target.value) })}
                        className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-zinc-300">Expense Name</Label>
                    <Input 
                      placeholder="e.g. Venue Deposit" 
                      value={newItem.item_name}
                      onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                      className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleAddExpense} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Expense</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
              <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="font-serif italic text-2xl dark:text-white">Edit Expense</DialogTitle>
                </DialogHeader>
                {editingItem && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="dark:text-zinc-300">Category</Label>
                      <Input 
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="dark:text-zinc-300">Estimated Cost ({currency})</Label>
                        <Input 
                          type="number" 
                          value={editingItem.estimated_cost === 0 ? '' : editingItem.estimated_cost}
                          onChange={(e) => setEditingItem({ ...editingItem, estimated_cost: Number(e.target.value) })}
                          className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-zinc-300">Actual Cost ({currency})</Label>
                        <Input 
                          type="number" 
                          value={editingItem.actual_cost === 0 ? '' : editingItem.actual_cost}
                          onChange={(e) => setEditingItem({ ...editingItem, actual_cost: Number(e.target.value) })}
                          className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-zinc-300">Expense Name</Label>
                      <Input 
                        value={editingItem.item_name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                        className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleEditExpense} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                  <TableHead className="w-[200px] font-medium text-zinc-500 dark:text-zinc-400">Category</TableHead>
                  <TableHead className="font-medium text-zinc-500 dark:text-zinc-400">Estimated Cost</TableHead>
                  <TableHead className="font-medium text-zinc-500 dark:text-zinc-400">Actual Cost</TableHead>
                  <TableHead className="font-medium text-zinc-500 dark:text-zinc-400">Status</TableHead>
                  <TableHead className="w-[250px] font-medium text-zinc-500 dark:text-zinc-400">Progress</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.map((item) => {
                  const isOver = item.actual_cost > item.estimated_cost;
                  const percentOfEstimated = item.estimated_cost > 0 ? (item.actual_cost / item.estimated_cost) * 100 : 0;
                  
                  return (
                    <TableRow key={item.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                      <TableCell className="font-medium text-zinc-900 dark:text-white">
                        <div className="flex flex-col">
                           <span>{item.category}</span>
                           <span className="text-xs text-zinc-400 font-normal">{item.item_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400">{formatCurrency(item.estimated_cost)}</TableCell>
                      <TableCell className={`font-semibold ${isOver ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                        {formatCurrency(item.actual_cost)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOver ? (
                            <div className="flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 uppercase border border-red-100 dark:border-red-500/20">
                              <AlertCircle className="h-3 w-3" />
                              Over
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase border border-emerald-100 dark:border-emerald-500/20">
                              <TrendingUp className="h-3 w-3" />
                              On Track
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div 
                              className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-zinc-900 dark:bg-white'}`} 
                              style={{ width: `${Math.min(percentOfEstimated, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{Math.round(percentOfEstimated)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
