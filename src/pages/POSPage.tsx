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
      prev.map((c) => (c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c)).filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); setShowBill(false); };

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

  const generateBillHTML = () => {
    const now = new Date();
    const billNo = `A${Math.floor(1000 + Math.random() * 9000)}`;
    const date = now.toLocaleDateString("en-GB");
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const totalQty = cart.reduce((sum, c) => sum + c.quantity, 0);
    const dash = "- ".repeat(35);

    const itemRows = cart.map((item, i) =>
      `<tr>
        <td style="padding:2px 4px">${i + 1}</td>
        <td style="padding:2px 4px">${item.name}</td>
        <td style="padding:2px 4px;text-align:center">${item.quantity}</td>
        <td style="padding:2px 4px;text-align:right">${item.price.toFixed(2)}</td>
        <td style="padding:2px 4px;text-align:right">${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join("");

    return `<!DOCTYPE html>
<html><head><style>
  @page { size: 80mm auto; margin: 5mm; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; margin: 0; padding: 15px; max-width: 350px; margin: 0 auto; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .dash { text-align: center; letter-spacing: 1px; color: #999; margin: 6px 0; font-size: 10px; }
  .right { text-align: right; }
  .red { color: #dc2626; }
  .green { color: #16a34a; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 2px 4px; border-bottom: 1px solid #333; }
  .info-row { display: flex; justify-content: space-between; font-size: 11px; }
  .total-row { display: flex; justify-content: space-between; font-size: 12px; }
  .grand { font-size: 14px; font-weight: bold; }
  .footer-line { width: 120px; border-bottom: 1px solid #000; margin: 10px auto 0; }
</style></head><body>
  <div class="center">
    <div class="bold" style="font-size:18px;letter-spacing:1px">FRIED & CRISPY</div>
    <div style="font-size:11px;margin-top:4px">Main Market Sonbarsa Bazar</div>
    <div style="font-size:11px">Gorakhpur</div>
    <div style="font-size:11px">Phone: 8005040580</div>
    <div style="font-size:11px">E-Mail: info@friedandcrispy.com</div>
  </div>
  <div class="dash">${dash}</div>
  <div class="info-row"><span>Customer: ${paymentMethod.toUpperCase()}</span><span>Bill No: ${billNo}</span></div>
  <div class="info-row"><span>Mobile:</span><span>Date: ${date}</span></div>
  <div class="info-row"><span>User: ADMIN</span><span>Time: ${time}</span></div>
  <div class="dash">${dash}</div>
  <table>
    <tr><th>S.</th><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amt</th></tr>
    ${itemRows}
  </table>
  <div class="dash">${dash}</div>
  <div class="right" style="font-size:11px">Item Qty: ${totalQty}</div>
  <div class="right" style="font-size:11px">Round off: 0.00</div>
  <div style="margin-top:8px">
    <div class="total-row bold"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
    <div class="total-row red"><span class="bold">Discount:</span><span>-₹${discount.toFixed(2)}</span></div>
    <div class="total-row grand"><span>G.TOTAL :-</span><span>₹${total.toFixed(2)}</span></div>
  </div>
  <div class="right green" style="margin-top:6px;font-size:11px">Saving ₹${discount.toFixed(2)}</div>
  <div class="dash">${dash}</div>
  <div class="center" style="margin-top:8px">
    <div class="bold">Happy to See you again</div>
    <div style="font-style:italic">"FRIED & CRISPY"</div>
    <div class="bold" style="font-size:14px;margin-top:8px">!!! Thanks !!!</div>
    <div class="footer-line"></div>
  </div>
</body></html>`;
  };

  const printBill = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(generateBillHTML());
      w.document.close();
      setTimeout(() => w.print(), 300);
    }
  };

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
              <Input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 font-body" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" className="rounded-full font-body text-xs"
                onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <button key={item.id} onClick={() => addToCart(item)}
                className="bg-card border rounded-xl p-3 text-left hover:border-primary/50 hover:shadow-md transition-all group">
                {item.image_url ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
              {/* Receipt - styled like a real bill */}
              <div ref={billRef} className="bg-white text-black p-6 rounded-xl border" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "13px" }}>
                {/* Header */}
                <div className="text-center mb-1">
                  <h3 className="text-xl font-bold tracking-wide">FRIED & CRISPY</h3>
                  <p className="text-xs mt-1">Main Market Sonbarsa Bazar</p>
                  <p className="text-xs">Gorakhpur</p>
                  <p className="text-xs">Phone: 8005040580</p>
                  <p className="text-xs">E-Mail: info@friedandcrispy.com</p>
                </div>

                <p className="text-center text-xs my-2" style={{ letterSpacing: "2px" }}>
                  {"- ".repeat(30)}
                </p>

                {/* Customer & Bill Info */}
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between"><span>Customer: {paymentMethod.toUpperCase()}</span><span>Bill No: A{Math.floor(1000 + Math.random() * 9000)}</span></div>
                  <div className="flex justify-between"><span>Mobile:</span><span>Date: {new Date().toLocaleDateString("en-GB")}</span></div>
                  <div className="flex justify-between"><span>User: ADMIN</span><span>Time: {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div>
                </div>

                <p className="text-center text-xs my-2" style={{ letterSpacing: "2px" }}>
                  {"- ".repeat(30)}
                </p>

                {/* Items Table Header */}
                <div className="text-xs font-bold flex mb-1">
                  <span className="w-6">S.</span>
                  <span className="flex-1">Description</span>
                  <span className="w-10 text-center">Qty</span>
                  <span className="w-16 text-right">Rate</span>
                  <span className="w-16 text-right">Amt</span>
                </div>

                {/* Items */}
                <div className="text-xs space-y-1">
                  {cart.map((item, index) => (
                    <div key={item.id} className="flex">
                      <span className="w-6">{index + 1}</span>
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="w-10 text-center">{item.quantity}</span>
                      <span className="w-16 text-right">{item.price.toFixed(2)}</span>
                      <span className="w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs my-2" style={{ letterSpacing: "2px" }}>
                  {"- ".repeat(30)}
                </p>

                {/* Totals */}
                <div className="text-xs text-right space-y-0.5">
                  <p>Item Qty: {cart.reduce((sum, c) => sum + c.quantity, 0)}</p>
                  <p>Round off: 0.00</p>
                </div>

                <div className="text-xs mt-2 space-y-1">
                  <div className="flex justify-between font-bold"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between" style={{ color: "#dc2626" }}><span className="font-bold">Discount:</span><span>-₹{discount.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-sm"><span>G.TOTAL :-</span><span>₹{total.toFixed(2)}</span></div>
                </div>

                <div className="text-right text-xs mt-2" style={{ color: "#16a34a" }}>
                  <p>Saving ₹{discount.toFixed(2)}</p>
                </div>

                <p className="text-center text-xs my-2" style={{ letterSpacing: "2px" }}>
                  {"- ".repeat(30)}
                </p>

                {/* Footer */}
                <div className="text-center text-xs space-y-1 mt-2">
                  <p className="font-bold">Happy to See you again</p>
                  <p className="italic">"FRIED & CRISPY"</p>
                  <p className="font-bold text-sm mt-2">!!! Thanks !!!</p>
                  <div className="flex justify-center mt-3">
                    <div className="w-32 border-b border-black"></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 font-body" onClick={exportPNG}><Download className="h-4 w-4 mr-1" /> PNG</Button>
                <Button variant="outline" className="flex-1 font-body" onClick={exportPDF}><Download className="h-4 w-4 mr-1" /> PDF</Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" className="flex-1 font-body" onClick={printBill}>
                  <Printer className="h-4 w-4 mr-1" /> Print Bill
                </Button>
                <Button className="flex-1 font-body" onClick={clearCart}>New Order</Button>
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
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-bold font-body">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-sm font-body w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
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
                    <Input type="number" min={0} value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))}
                      className="h-8 w-24 font-body text-sm" placeholder="0" />
                  </div>
                  <div className="space-y-1 text-sm font-body">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={paymentMethod === "Cash" ? "default" : "outline"} className="flex-1 font-body"
                      onClick={() => setPaymentMethod("Cash")}>
                      <Banknote className="h-4 w-4 mr-1" /> Cash
                    </Button>
                    <Button variant={paymentMethod === "Online" ? "default" : "outline"} className="flex-1 font-body"
                      onClick={() => setPaymentMethod("Online")}>
                      <CreditCard className="h-4 w-4 mr-1" /> Online
                    </Button>
                  </div>
                  <Button className="w-full font-body" size="lg" onClick={() => saveSale.mutate()} disabled={saveSale.isPending}>
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
