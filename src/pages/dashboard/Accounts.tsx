import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Youtube, Linkedin, Plus, CheckCircle, XCircle, Link2, Key } from "lucide-react";
import type { ConnectedAccount } from "@/types";

const platformIcons: Record<string, any> = { YouTube: Youtube, LinkedIn: Linkedin };
const platformColors: Record<string, string> = { YouTube: "text-red-500", LinkedIn: "text-blue-600" };

const Accounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [accessToken, setAccessToken] = useState("");
  const [accountName, setAccountName] = useState("");

  const toggleAccount = (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  };

  const handleConnect = () => {
    if (!selectedPlatform || !accessToken || !accountName) return;

    const newAccount: ConnectedAccount = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      account_name: accountName,
      is_active: true,
      access_token: accessToken
    };

    setAccounts(prev => [...prev, newAccount]);
    
    // Reset form and close dialog
    setSelectedPlatform("");
    setAccessToken("");
    setAccountName("");
    setIsDialogOpen(false);
  };

  const showAccessToken = (token: string) => {
    // Mask the token for display
    return token ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}` : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground text-sm">Manage your social media connections</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select 
                  id="platform"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="">Select platform</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input 
                  id="accountName"
                  placeholder="e.g., My Business Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <div className="relative">
                  <Input 
                    id="accessToken"
                    type="password"
                    placeholder="Enter your access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-10"
                  />
                  <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your access token is required to authenticate with the platform
                </p>
              </div>

              <Button 
                onClick={handleConnect} 
                className="w-full"
                disabled={!selectedPlatform || !accessToken || !accountName}
              >
                Connect Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 bg-card border-border">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No accounts connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Connect your YouTube or LinkedIn accounts to start managing your social media presence
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Connect Your First Account
            </Button>
          </div>
        </Card>
      ) : (
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
                  <div className="flex items-center gap-2">
                    {a.access_token && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        <Key className="w-3 h-3" />
                        <span title={a.access_token}>{showAccessToken(a.access_token)}</span>
                      </div>
                    )}
                    {a.is_active ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>
                <Button variant={a.is_active ? "outline" : "default"} size="sm" onClick={() => toggleAccount(a.id)} className="w-full">
                  {a.is_active ? "Disconnect" : "Reconnect"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Accounts;