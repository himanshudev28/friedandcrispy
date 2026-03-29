import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Search, Package, UtensilsCrossed } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

const statusConfig: Record<string, { label: string; className: string; emoji: string }> = {
  pending: { label: "Pending", className: "border-yellow-500 text-yellow-600 bg-yellow-50", emoji: "⏳" },
  accepted: { label: "Accepted", className: "bg-blue-500 text-white", emoji: "✅" },
  completed: { label: "Completed", className: "bg-green-500 text-white", emoji: "🎉" },
  rejected: { label: "Rejected", className: "bg-red-500 text-white", emoji: "❌" },
};

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-load last order ID
  useEffect(() => {
    const lastId = localStorage.getItem("lastOrderId");
    if (lastId) {
      setOrderId(lastId);
      fetchOrder(lastId);
    }
  }, []);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id" as any, id.trim().toUpperCase())
      .maybeSingle();
    setOrder(data);
    setLoading(false);
  };

  const handleTrack = () => {
    if (!orderId.trim()) return;
    fetchOrder(orderId);
  };

  // Realtime updates
  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel("track-order")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  const sc = order ? (statusConfig[order.status] || statusConfig.pending) : null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold">Fried&Crispy</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-lg">
        <h1 className="text-3xl font-display font-bold text-center mb-2">Track Your Order</h1>
        <p className="text-muted-foreground text-center font-body mb-8">Enter your Order ID to check status</p>

        <div className="flex gap-2 mb-8">
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            placeholder="ORD-12345"
            className="font-body text-lg"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button onClick={handleTrack} disabled={loading} className="font-body">
            <Search className="h-4 w-4 mr-2" /> Track
          </Button>
        </div>

        {loading && (
          <div className="h-48 rounded-xl bg-muted animate-pulse" />
        )}

        {!loading && searched && !order && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-body">No order found with this ID</p>
            <p className="text-sm text-muted-foreground font-body mt-1">Please check your Order ID and try again</p>
          </div>
        )}

        {!loading && order && sc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">Order {order.order_id}</CardTitle>
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge className={`${sc.className} font-body text-sm`}>
                    {sc.emoji} {sc.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <span>₹{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm font-body">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.phone}</p>
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

                {/* Status Timeline */}
                <div className="pt-2">
                  <p className="text-sm font-semibold font-body mb-3">Order Status</p>
                  <div className="flex items-center gap-2">
                    {["pending", "accepted", "completed"].map((step, i) => {
                      const steps = ["pending", "accepted", "completed"];
                      const currentIdx = steps.indexOf(order.status);
                      const isActive = i <= currentIdx && order.status !== "rejected";
                      const isRejected = order.status === "rejected";
                      return (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <div className={`h-3 w-3 rounded-full ${isRejected ? "bg-destructive/30" : isActive ? "bg-primary" : "bg-muted-foreground/20"}`} />
                          <span className={`text-xs font-body capitalize ${isActive && !isRejected ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {order.status === "rejected" && (
                    <p className="text-sm text-destructive font-body mt-2">Your order was rejected. Please contact us for details.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
