import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { openWhatsApp } from "@/lib/whatsapp";
import { MessageCircle, Trash2, Clock, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_id: string | null;
  items: OrderItem[];
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  order_type: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending: { label: "Pending", variant: "outline", className: "border-yellow-500 text-yellow-600 bg-yellow-50" },
  accepted: { label: "Accepted", variant: "default", className: "bg-blue-500 text-white" },
  completed: { label: "Completed", variant: "default", className: "bg-green-500 text-white" },
  rejected: { label: "Rejected", variant: "destructive", className: "bg-red-500 text-white" },
};

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return (data as unknown as Order[]) || [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
    },
    onError: () => toast.error("Failed to delete order"),
  });

  const sendWhatsApp = (order: Order, type: "accepted" | "rejected" | "completed") => {
    const phone = order.phone.replace(/\D/g, "");
    const phoneWithCode = phone.startsWith("91") ? phone : `91${phone}`;
    
    const messages: Record<string, string> = {
      accepted: `Hello ${order.customer_name},\n\nYour order has been accepted ✅\n\nTotal: ₹${order.total}\n\nWe are preparing your order.`,
      rejected: `Hello ${order.customer_name},\n\nSorry, your order has been rejected ❌\n\nPlease contact us for more details.`,
      completed: `Hello ${order.customer_name},\n\nYour order is ready / completed 🎉\n\nThank you for ordering with us!`,
    };

    openWhatsApp(phoneWithCode, messages[type]);
  };


  const canTransition = (current: string, next: string) => {
    if (current === "pending") return next === "accepted" || next === "rejected";
    if (current === "accepted") return next === "completed";
    return false;
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Orders</h1>
            <p className="text-muted-foreground font-body">Manage incoming orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-body">
              <Clock className="h-3 w-3 mr-1" />
              {orders.filter(o => o.status === "pending").length} Pending
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-body">No orders yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-lg">{order.customer_name}</CardTitle>
                        <p className="text-sm font-semibold text-primary font-body">{order.order_id || "—"}</p>
                        <p className="text-sm text-muted-foreground font-body mt-1">
                          {new Date(order.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${sc.className} font-body`}>{sc.label}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteOrder.mutate(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Items */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm font-body">
                      {(order.items as OrderItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-body">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{order.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{order.address || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Type</p>
                        <p className="font-medium">{order.order_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="font-medium">{order.payment_method}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          updateStatus.mutate({ id: order.id, status: value });
                          if (value === "accepted" || value === "rejected" || value === "completed") {
                            sendWhatsApp(order, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[160px] font-body">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending" disabled={order.status !== "pending"}>Pending</SelectItem>
                          <SelectItem value="accepted" disabled={!canTransition(order.status, "accepted")}>Accepted</SelectItem>
                          <SelectItem value="completed" disabled={!canTransition(order.status, "completed")}>Completed</SelectItem>
                          <SelectItem value="rejected" disabled={!canTransition(order.status, "rejected")}>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="font-body" onClick={() => {
                        const phone = order.phone.replace(/\D/g, "");
                        const phoneWithCode = phone.startsWith("91") ? phone : `91${phone}`;
                        openWhatsApp(phoneWithCode, "");
                      }}>
                        <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
