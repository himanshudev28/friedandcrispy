import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, UtensilsCrossed, Upload } from "lucide-react";
import { toast } from "sonner";

const AdminMenuManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", imageFile: null as File | null });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("name").order("name");
      return (data?.map((c: any) => c.name) as string[]) || [];
    },
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu").select("*").order("created_at", { ascending: false });
      return (data as MenuItem[]) || [];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let image_url = editItem?.image_url || null;
      if (form.imageFile) {
        image_url = await uploadImage(form.imageFile);
      }
      const payload = { name: form.name, price: parseFloat(form.price), category: form.category, image_url };
      if (editItem) {
        const { error } = await supabase.from("menu").update(payload).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success(editItem ? "Item updated" : "Item added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save item"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Item deleted");
    },
  });

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, price: item.price.toString(), category: item.category, imageFile: null });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", price: "", category: categories[0] || "", imageFile: null });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Fill all fields"); return; }
    saveMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Menu Manager</h1>
            <p className="text-muted-foreground font-body">Add, edit, or remove menu items</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-body" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body">Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" className="font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Price (₹)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById("img-upload")?.click()}>
                    {form.imageFile ? (
                      <p className="text-sm text-foreground font-body">{form.imageFile.name}</p>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground font-body">Click to upload image</p>
                      </div>
                    )}
                    <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })} />
                  </div>
                </div>
                <Button type="submit" className="w-full font-body" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editItem ? "Update Item" : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8 font-body">Loading...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">No menu items yet. Add your first item!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Image</TableHead>
                    <TableHead className="font-body">Name</TableHead>
                    <TableHead className="font-body">Category</TableHead>
                    <TableHead className="font-body">Price</TableHead>
                    <TableHead className="font-body text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold font-body">{item.name}</TableCell>
                      <TableCell><span className="text-xs bg-secondary px-2 py-1 rounded-full font-body">{item.category}</span></TableCell>
                      <TableCell className="font-bold font-body">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AdminMenuManager;
