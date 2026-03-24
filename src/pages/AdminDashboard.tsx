import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleRecord } from "@/types/menu";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ShoppingCart, Download, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
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

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const todaySales = sales.filter((s) => new Date(s.created_at) >= startOfDay(new Date()));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  // Last 7 days chart data
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const dailyData = last7Days.map((day) => {
    const daySales = sales.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
    return { day: format(day, "EEE"), revenue: daySales.reduce((sum, s) => sum + s.total, 0) };
  });

  // Monthly trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const monthSales = sales.filter((s) => {
      const date = new Date(s.created_at);
      return date >= start && date <= end;
    });
    return { month: format(d, "MMM"), revenue: monthSales.reduce((sum, s) => sum + s.total, 0) };
  });

  const exportSales = (period: "daily" | "weekly" | "monthly") => {
    let filtered = sales;
    const now = new Date();
    if (period === "daily") filtered = sales.filter((s) => new Date(s.created_at) >= startOfDay(now));
    else if (period === "weekly") filtered = sales.filter((s) => new Date(s.created_at) >= subDays(now, 7));
    else filtered = sales.filter((s) => new Date(s.created_at) >= startOfMonth(now));

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
    XLSX.writeFile(wb, `sales_${period}_${format(now, "yyyyMMdd")}.xlsx`);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground font-body">Overview of your restaurant performance</p>
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
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Today's Sales</p>
                  <p className="text-2xl font-bold font-display">₹{todayRevenue.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Total Orders</p>
                  <p className="text-2xl font-bold font-display">{sales.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Export Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Export Sales Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="font-body" onClick={() => exportSales("daily")}>
                <Download className="h-4 w-4 mr-2" /> Daily Report
              </Button>
              <Button variant="outline" className="font-body" onClick={() => exportSales("weekly")}>
                <Download className="h-4 w-4 mr-2" /> Weekly Report
              </Button>
              <Button variant="outline" className="font-body" onClick={() => exportSales("monthly")}>
                <Download className="h-4 w-4 mr-2" /> Monthly Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-body">No sales yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Date</TableHead>
                    <TableHead className="font-body">Time</TableHead>
                    <TableHead className="font-body">Items</TableHead>
                    <TableHead className="font-body">Total</TableHead>
                    <TableHead className="font-body">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.slice(0, 20).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-body">{format(new Date(sale.created_at), "MMM dd, yyyy")}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
