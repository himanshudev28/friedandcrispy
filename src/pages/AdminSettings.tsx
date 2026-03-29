import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Star, Settings } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [ratingsEnabled, setRatingsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from("settings").select("*") as any).eq("key", "ratings_enabled").single();
      if (data) setRatingsEnabled(data.value === true);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleRatings = async (enabled: boolean) => {
    setRatingsEnabled(enabled);
    const { error } = await (supabase.from("settings").update({ value: enabled, updated_at: new Date().toISOString() }) as any).eq("key", "ratings_enabled");
    if (error) {
      setRatingsEnabled(!enabled);
      toast.error("Failed to update setting");
    } else {
      toast.success(`Ratings & Reviews ${enabled ? "enabled" : "disabled"}`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Settings className="h-7 w-7" /> Settings
          </h1>
          <p className="text-muted-foreground font-body">Manage app features and preferences</p>
        </div>

        {loading ? (
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Ratings & Reviews
              </CardTitle>
              <CardDescription className="font-body">
                Allow users to rate and review menu items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-body font-medium">Enable Ratings & Reviews</Label>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">
                    {ratingsEnabled ? "Users can see and add ratings & reviews" : "Ratings & reviews are hidden from all pages"}
                  </p>
                </div>
                <Switch checked={ratingsEnabled} onCheckedChange={toggleRatings} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
