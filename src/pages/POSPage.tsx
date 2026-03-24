import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, CartItem } from "@/types/menu";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, UtensilsCrossed, Search, Printer, Download, CreditCard, Banknote, X } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const POSPage = () => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBill, setShowBill] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu").select("*").order("name");
      return (data as MenuItem[]) || [];
    },
  });

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setShowBill(false);
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const saveSale = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sales").insert({
        items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })) as any,
        total,
        discount,
        payment_method: paymentMethod,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale saved!");
      setShowBill(true);
    },
    onError: () => toast.error("Failed to save sale"),
  });

  const exportPNG = async () => {
    if (!billRef.current) return;
    const canvas = await html2canvas(billRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `bill_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Bill downloaded as PNG");
  };

  const exportPDF = async () => {
    if (!billRef.current) return;
    const canvas = await html2canvas(billRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`bill_${Date.now()}.pdf`);
    toast.success("Bill downloaded as PDF");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] md:h-screen overflow-hidden">
        {/* Menu Side */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-body"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full font-body text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-card border rounded-xl p-3 text-left hover:border-primary/50 hover:shadow-md transition-all group"
              >
                {item.image_url ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="font-semibold text-sm font-body truncate">{item.name}</p>
                <p className="text-primary font-bold font-body">₹{item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Side */}
        <div className="w-full lg:w-96 border-l bg-card flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Current Order</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive font-body" onClick={clearCart}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          {showBill ? (
            <div className="flex-1 overflow-auto p-4">
              {/* Receipt */}
              <div
                ref={billRef}
                className="bg-white text-black p-6 rounded-xl border"
                style={{ fontFamily: "monospace" }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold">🔥 Fried&Crispy</h3>
                  <p className="text-xs text-gray-500">Restaurant & Café</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="my-3" />
                <p className="text-center text-xs text-gray-500">Payment: {paymentMethod}</p>
                <p className="text-center text-xs text-gray-400 mt-2">Thank you for dining with us! ❤️</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 font-body" onClick={exportPNG}>
                  <Download className="h-4 w-4 mr-1" /> PNG
                </Button>
                <Button variant="outline" className="flex-1 font-body" onClick={exportPDF}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button className="flex-1 font-body" onClick={clearCart}>
                  <Printer className="h-4 w-4 mr-1" /> New Order
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-body">Tap items to add to order</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-background rounded-lg p-3 border">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm font-body truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-body">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-bold font-body">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-sm font-body w-16 text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body text-muted-foreground">Discount ₹</span>
                    <Input
                      type="number"
                      min={0}
                      value={discount || ""}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="h-8 w-24 font-body text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={paymentMethod === "Cash" ? "default" : "outline"}
                      className="flex-1 font-body"
                      onClick={() => setPaymentMethod("Cash")}
                    >
                      <Banknote className="h-4 w-4 mr-1" /> Cash
                    </Button>
                    <Button
                      variant={paymentMethod === "Online" ? "default" : "outline"}
                      className="flex-1 font-body"
                      onClick={() => setPaymentMethod("Online")}
                    >
                      <CreditCard className="h-4 w-4 mr-1" /> Online
                    </Button>
                  </div>
                  <Button
                    className="w-full font-body"
                    size="lg"
                    onClick={() => saveSale.mutate()}
                    disabled={saveSale.isPending}
                  >
                    {saveSale.isPending ? "Saving..." : `Charge ₹${total.toFixed(2)}`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSPage;
