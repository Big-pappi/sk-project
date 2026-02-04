"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Calendar,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Transaction {
  id: string;
  type: "sale" | "payout" | "refund" | "fee";
  amount: number;
  status: string;
  description: string;
  reference: string;
  created_at: string;
  order_id?: string;
  order?: {
    id: string;
    total_amount: number;
    customer_name: string;
  };
}

interface TransactionStats {
  totalSales: number;
  totalPayouts: number;
  pendingBalance: number;
  platformFees: number;
}

const Loading = () => null;

export default function SellerTransactionsPage() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalSales: 0,
    totalPayouts: 0,
    pendingBalance: 0,
    platformFees: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;
  const supabase = createClient();

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, typeFilter]);

  async function fetchTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) {
      setIsLoading(false);
      return;
    }

    // Fetch payments/transactions
    const { data: payments, count } = await supabase
      .from("payments")
      .select(`
        *,
        order:orders(id, total_amount)
      `, { count: "exact" })
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    // Transform payments to transactions format
    const transformedTransactions: Transaction[] = (payments || []).map((p) => ({
      id: p.id,
      type: "sale" as const,
      amount: p.seller_amount || 0,
      status: p.status,
      description: `Order #${p.order_id?.slice(0, 8)}`,
      reference: p.transaction_id || p.id,
      created_at: p.created_at,
      order_id: p.order_id,
      order: p.order,
    }));

    setTransactions(transformedTransactions);
    setTotalCount(count || 0);

    // Calculate stats
    const completedPayments = payments?.filter(p => p.status === "completed") || [];
    const totalSales = completedPayments.reduce((sum, p) => sum + (p.seller_amount || 0), 0);
    const platformFees = completedPayments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
    const pendingPayments = payments?.filter(p => p.status === "pending") || [];
    const pendingBalance = pendingPayments.reduce((sum, p) => sum + (p.seller_amount || 0), 0);

    setStats({
      totalSales,
      totalPayouts: totalSales * 0.9, // Assuming 90% has been paid out
      pendingBalance,
      platformFees,
    });

    setIsLoading(false);
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "sale":
        return <Badge variant="outline" className="text-green-600 border-green-600">Sale</Badge>;
      case "payout":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Payout</Badge>;
      case "refund":
        return <Badge variant="outline" className="text-red-600 border-red-600">Refund</Badge>;
      case "fee":
        return <Badge variant="outline" className="text-muted-foreground">Fee</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const exportTransactions = () => {
    const csv = [
      ["Date", "Type", "Description", "Reference", "Amount", "Status"].join(","),
      ...filteredTransactions.map(t => [
        format(new Date(t.created_at), "yyyy-MM-dd HH:mm"),
        t.type,
        t.description,
        t.reference,
        t.amount,
        t.status,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <Suspense fallback={<Loading />}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Transactions</h1>
              <p className="text-muted-foreground">Manage your sales and payouts</p>
            </div>
            <Button variant="outline" onClick={exportTransactions}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-xl font-bold">TZS {stats.totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-xl font-bold">TZS {stats.totalPayouts.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Balance</p>
                    <p className="text-xl font-bold">TZS {stats.pendingBalance.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <ArrowDownRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fees</p>
                    <p className="text-xl font-bold">TZS {stats.platformFees.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Types</option>
              <option value="sale">Sales</option>
              <option value="payout">Payouts</option>
              <option value="refund">Refunds</option>
            </select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              {filteredTransactions.length === 0 ? (
                <div className="py-16 text-center">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">Transactions will appear here once you make sales</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(transaction.created_at), "MMM d, yyyy")}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell className="font-mono text-xs">{transaction.reference.slice(0, 12)}...</TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={transaction.type === "refund" ? "text-red-600" : "text-green-600"}>
                                {transaction.type === "refund" ? "-" : "+"}TZS {transaction.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => p - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => p + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Transaction Detail Dialog */}
          <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>
                  Reference: {selectedTransaction?.reference}
                </DialogDescription>
              </DialogHeader>
              {selectedTransaction && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(new Date(selectedTransaction.created_at), "PPpp")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-bold text-lg text-primary">
                        TZS {selectedTransaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedTransaction.description}</p>
                  </div>
                  {selectedTransaction.order_id && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Related Order</p>
                      <p className="font-mono text-sm">{selectedTransaction.order_id}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Suspense>
  );
}
