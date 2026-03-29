import { useState, useEffect } from "react";
import { CartItem } from "@/types/menu";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openWhatsApp } from "@/lib/whatsapp";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Trash2, Send, X } from "lucide-react";
import { toast } from "sonner";

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  orderType: "Delivery" | "Pickup";
  paymentMethod: "Cash" | "Online";
}

const STORAGE_KEY = "fc_customer_details";

const CartDrawer = ({ cart, onUpdateQty, onRemove, onClear }: CartDrawerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<CustomerDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: "", phone: "", address: "", orderType: "Delivery", paymentMethod: "Cash" };
  });

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {}
  }, [details]);

  const validate = () => {
    if (!details.name.trim()) { toast.error("Please enter your name"); return false; }
    if (!details.phone.trim() || details.phone.trim().length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (details.orderType === "Delivery" && !details.address.trim()) { toast.error("Please enter your address for delivery"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      // Save to database
      const { data: orderData, error } = await supabase.from("orders").insert({
        items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })) as any,
        total,
        customer_name: details.name.trim(),
        phone: details.phone.trim(),
        address: details.address.trim() || "",
        order_type: details.orderType,
        payment_method: details.paymentMethod,
        status: "pending",
      }).select().single();
      if (error) throw error;

      const generatedOrderId = (orderData as any)?.order_id || "N/A";
      localStorage.setItem("lastOrderId", generatedOrderId);

      // Send WhatsApp notification
      const itemLines = cart.map(c => `- ${c.name} x${c.quantity} = ₹${(c.price * c.quantity).toFixed(2)}`).join("\n");
      const message = `New Order 🚨\nOrder ID: ${generatedOrderId}\n\nItems:\n${itemLines}\n\nTotal: ₹${total.toFixed(2)}\n\nCustomer Details:\nName: ${details.name.trim()}\nPhone: ${details.phone.trim()}\nAddress: ${details.address.trim() || "N/A (Pickup)"}\n\nOrder Type: ${details.orderType}\nPayment Method: ${details.paymentMethod}`;

      openWhatsApp("917007835915", message);
      toast.success(`Order placed! Your Order ID: ${generatedOrderId}`, { duration: 10000 });
      setShowForm(false);
      onClear();
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg font-body" size="icon">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display">Your Cart ({itemCount})</SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground font-body">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-3 py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm font-body truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-body">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQty(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold font-body">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQty(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold text-sm font-body w-14 text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemove(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold font-body">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="font-body" onClick={onClear}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                  <Button className="flex-1 font-body" onClick={() => setShowForm(true)}>
                    <Send className="h-4 w-4 mr-2" /> Place Order
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm font-body">
              {cart.map(c => (
                <div key={c.id} className="flex justify-between">
                  <span>{c.name} x{c.quantity}</span>
                  <span>₹{(c.price * c.quantity).toFixed(0)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="font-body">Name *</Label>
                <Input value={details.name} onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} placeholder="Your name" className="font-body" />
              </div>
              <div>
                <Label className="font-body">Phone *</Label>
                <Input value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} placeholder="10-digit phone number" type="tel" className="font-body" />
              </div>
              <div>
                <Label className="font-body">Address {details.orderType === "Delivery" ? "*" : ""}</Label>
                <Input value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} placeholder="Delivery address" className="font-body" />
              </div>

              <div>
                <Label className="font-body mb-2 block">Order Type</Label>
                <RadioGroup value={details.orderType} onValueChange={(v) => setDetails(d => ({ ...d, orderType: v as "Delivery" | "Pickup" }))} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Delivery" id="delivery" />
                    <Label htmlFor="delivery" className="font-body cursor-pointer">Delivery</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Pickup" id="pickup" />
                    <Label htmlFor="pickup" className="font-body cursor-pointer">Pickup</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="font-body mb-2 block">Payment Method</Label>
                <RadioGroup value={details.paymentMethod} onValueChange={(v) => setDetails(d => ({ ...d, paymentMethod: v as "Cash" | "Online" }))} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Cash" id="cash" />
                    <Label htmlFor="cash" className="font-body cursor-pointer">Cash</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Online" id="online" />
                    <Label htmlFor="online" className="font-body cursor-pointer">Online</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button className="w-full font-body" size="lg" onClick={placeOrder} disabled={submitting}>
              <Send className="h-4 w-4 mr-2" /> {submitting ? "Placing Order..." : "Send Order to WhatsApp"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartDrawer;
