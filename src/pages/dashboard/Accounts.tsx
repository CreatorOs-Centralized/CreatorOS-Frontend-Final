import { useState } from "react";
import { mockAccounts } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Instagram, Plus, CheckCircle, XCircle, Link2 } from "lucide-react";
import type { ConnectedAccount } from "@/types";

const platformIcons: Record<string, any> = { YouTube: Youtube, Instagram: Instagram };
const platformColors: Record<string, string> = { YouTube: "text-red-500", Instagram: "text-pink-500" };

const Accounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(mockAccounts);

  const toggleAccount = (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground text-sm">Manage your social media connections</p>
        </div>
        <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Connect Account</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {accounts.map(a => {
          const Icon = platformIcons[a.platform] || Link2;
          return (
            <Card key={a.id} className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${platformColors[a.platform] || ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{a.platform}</p>
                    <p className="text-xs text-muted-foreground">{a.account_name}</p>
                  </div>
                </div>
                {a.is_active ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
              </div>
              <Button variant={a.is_active ? "outline" : "default"} size="sm" onClick={() => toggleAccount(a.id)} className="w-full">
                {a.is_active ? "Disconnect" : "Reconnect"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Accounts;
