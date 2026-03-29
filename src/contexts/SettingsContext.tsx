import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SettingsContextType {
  ratingsEnabled: boolean;
}

const SettingsContext = createContext<SettingsContextType>({ ratingsEnabled: true });

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [ratingsEnabled, setRatingsEnabled] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from("settings").select("*") as any).eq("key", "ratings_enabled").single();
      if (data) setRatingsEnabled(data.value === true);
    };
    fetch();

    const channel = supabase
      .channel("settings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, (payload: any) => {
        if (payload.new?.key === "ratings_enabled") {
          setRatingsEnabled(payload.new.value === true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <SettingsContext.Provider value={{ ratingsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};
