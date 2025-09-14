import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ApiKeySettings() {
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing API key from localStorage
    const storedKey = localStorage.getItem("googleApiKey");
    if (storedKey) {
      setGoogleApiKey(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (googleApiKey.trim()) {
      localStorage.setItem("googleApiKey", googleApiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your Google Vision API key has been saved successfully.",
      });
    } else {
      toast({
        title: "Invalid Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem("googleApiKey");
    setGoogleApiKey("");
    toast({
      title: "API Key Removed",
      description: "Your Google Vision API key has been removed.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">API Key Setup</h1>
        <p className="text-muted-foreground">
          Configure your Google API key to enable AI-powered features
        </p>
      </div>

      {/* Google API Key Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Google API Key</h2>
        </div>
        
        <p className="text-muted-foreground">
          Enter your Google API key to enable AI features like auto-generating topics, 
          finding resources, and getting study assistance.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter your Google Vision API key"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                className="font-mono pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveKey}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!googleApiKey.trim()}
            >
              Save API Key
            </Button>
            {localStorage.getItem("googleApiKey") && (
              <Button
                variant="outline"
                onClick={handleRemoveKey}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {localStorage.getItem("googleApiKey") && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                API key is configured and AI features are enabled
              </span>
            </div>
          )}
        </div>
      </div>

      {/* How to get API Key */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How to get a Google API Key</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="font-medium text-primary">1.</span>
            <span>Go to the <span className="text-primary underline cursor-pointer">Google Cloud Console</span></span>
          </div>
          <div className="flex gap-3">
            <span className="font-medium text-primary">2.</span>
            <span>Create a new project or select an existing one</span>
          </div>
          <div className="flex gap-3">
            <span className="font-medium text-primary">3.</span>
            <span>Enable the required APIs (Generative AI API)</span>
          </div>
          <div className="flex gap-3">
            <span className="font-medium text-primary">4.</span>
            <span>Go to "APIs & Services" → "Credentials"</span>
          </div>
          <div className="flex gap-3">
            <span className="font-medium text-primary">5.</span>
            <span>Click "Create Credentials" → "API Key"</span>
          </div>
          <div className="flex gap-3">
            <span className="font-medium text-primary">6.</span>
            <span>Copy the generated API key and paste it above</span>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <Key className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Note:</p>
              <p className="text-amber-700">
                Keep your API key secure and never share it publicly. This key is stored locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}