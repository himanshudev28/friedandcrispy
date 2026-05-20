import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleRecord } from "@/types/menu";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, TrendingUp, ShoppingCart, Download, Trash2, CalendarIcon, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, subDays, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { toast } from "sonner";

type DatePreset = "today" | "week" | "month" | "year" | "custom";
type PaymentFilter = "all" | "Cash" | "Online";

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [preset, setPreset] = useState<DatePreset>("today");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
      return (data as unknown as SaleRecord[]) || [];
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale deleted");
    },
    onError: () => toast.error("Failed to delete sale"),
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "today": return { start: startOfDay(now), end: endOfDay(now) };
      case "week": return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "month": return { start: startOfMonth(now), end: endOfMonth(now) };
      case "year": return { start: startOfYear(now), end: endOfYear(now) };
      case "custom": return {
        start: customFrom ? startOfDay(customFrom) : startOfDay(now),
        end: customTo ? endOfDay(customTo) : endOfDay(now),
      };
    }
  }, [preset, customFrom, customTo]);

  const filtered = useMemo(() =>
    sales.filter((s) => {
      const d = new Date(s.created_at);
      const inDateRange = isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
      const matchesPayment = paymentFilter === "all" || s.payment_method === paymentFilter;
      return inDateRange && matchesPayment;
    }),
  [sales, dateRange, paymentFilter]);

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = filtered.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart: daily breakdown within the range
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    // Limit to last 30 days max for readability
    const sliced = days.length > 30 ? days.slice(-30) : days;
    return sliced.map((day) => {
      const daySales = filtered.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
      return {
        day: format(day, days.length > 14 ? "dd MMM" : "EEE dd"),
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        orders: daySales.length,
      };
    });
  }, [filtered, dateRange]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedSales = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const exportFiltered = () => {
    if (filtered.length === 0) { toast.error("No sales to export"); return; }
    const rows = filtered.map((s) => ({
      Date: format(new Date(s.created_at), "yyyy-MM-dd"),
      Time: format(new Date(s.created_at), "HH:mm"),
      Items: (s.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(", "),
      Subtotal: (s.total + s.discount).toFixed(2),
      Discount: s.discount.toFixed(2),
      Total: s.total.toFixed(2),
      Payment: s.payment_method,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `sales_${format(dateRange.start, "yyyyMMdd")}_${format(dateRange.end, "yyyyMMdd")}.xlsx`);
    toast.success("Report exported!");
  };

  const presetButtons: { key: DatePreset; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "custom", label: "Custom" },
  ];

  // Reset page when filters change
  const handlePreset = (p: DatePreset) => { setPreset(p); setPage(1); };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground font-body text-sm">
              {format(dateRange.start, "MMM dd, yyyy")} — {format(dateRange.end, "MMM dd, yyyy")}
            </p>
          </div>
          <Button variant="outline" className="font-body" onClick={exportFiltered}>
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {presetButtons.map((b) => (
            <Button
              key={b.key}
              variant={preset === b.key ? "default" : "outline"}
              size="sm"
              className="font-body rounded-full"
              onClick={() => handlePreset(b.key)}
            >
              {b.label}
            </Button>
          ))}

          {preset === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("font-body", !customFrom && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {customFrom ? format(customFrom, "MMM dd, yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customFrom} onSelect={(d) => { setCustomFrom(d); setPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-sm">→</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("font-body", !customTo && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {customTo ? format(customTo, "MMM dd, yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customTo} onSelect={(d) => { setCustomTo(d); setPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Total Revenue</p>
                  <p className="text-2xl font-bold font-display">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Total Orders</p>
                  <p className="text-2xl font-bold font-display">{totalOrders}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Avg. Order Value</p>
                  <p className="text-2xl font-bold font-display">₹{avgOrderValue.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Daily Revenue</CardTitle></CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 font-body">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-30} textAnchor="end" height={50} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Orders Trend</CardTitle></CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 font-body">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-30} textAnchor="end" height={50} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales with Pagination */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Sales ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-body">No sales in this period</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body">Date</TableHead>
                        <TableHead className="font-body">Time</TableHead>
                        <TableHead className="font-body">Items</TableHead>
                        <TableHead className="font-body">Total</TableHead>
                        <TableHead className="font-body">Payment</TableHead>
                        <TableHead className="font-body text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-body whitespace-nowrap">{format(new Date(sale.created_at), "MMM dd, yyyy")}</TableCell>
                          <TableCell className="font-body">{format(new Date(sale.created_at), "HH:mm")}</TableCell>
                          <TableCell className="font-body text-sm max-w-[200px] truncate">
                            {(sale.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(", ")}
                          </TableCell>
                          <TableCell className="font-bold font-body">₹{sale.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full font-body ${
                              sale.payment_method === "Cash" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                            }`}>
                              {sale.payment_method}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteSale.mutate(sale.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce<(number | "...")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`dot-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <Button
                            key={p}
                            variant={page === p ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 font-body"
                            onClick={() => setPage(p as number)}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
