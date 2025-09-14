import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ApiKeySettings() {
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false);
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
    setIsEditing(false);
    toast({
      title: "API Key Removed",
      description: "Your Google Vision API key has been removed.",
    });
  };

  const maskedKey = googleApiKey ? `${googleApiKey.substring(0, 8)}${"*".repeat(Math.max(0, googleApiKey.length - 12))}${googleApiKey.substring(googleApiKey.length - 4)}` : "";

  return (
    <div className="space-y-6">
      <Card className="card-beautiful">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Google Vision API</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="google-api-key" className="text-sm font-medium">
              API Key
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Add your Google Vision API key to improve receipt text extraction accuracy.
            </p>
            
            {!isEditing && googleApiKey ? (
              <div className="flex items-center gap-2">
                <Input
                  value={showKey ? googleApiKey : maskedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveKey}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  id="google-api-key"
                  type="text"
                  placeholder="Enter your Google Vision API key"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveKey}
                    className="button-glow"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Key
                  </Button>
                  {googleApiKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setGoogleApiKey(localStorage.getItem("googleApiKey") || "");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">How to get your API key:</h4>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. Go to Google Cloud Console</li>
              <li>2. Enable the Vision API</li>
              <li>3. Create credentials (API key)</li>
              <li>4. Restrict the key to Vision API</li>
              <li>5. Copy and paste the key above</li>
            </ol>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Key className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-primary mb-1">Privacy & Security</p>
                <p className="text-muted-foreground">
                  Your API key is stored locally in your browser and never sent to our servers. 
                  It's only used to make direct requests to Google Vision API from your device.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-beautiful">
        <CardHeader>
          <CardTitle className="text-lg">Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Better Text Recognition</p>
                <p className="text-muted-foreground">Google Vision API provides superior OCR accuracy compared to basic text extraction.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Smart Data Extraction</p>
                <p className="text-muted-foreground">Automatically identifies store names, amounts, and itemized details from receipts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Multiple Languages</p>
                <p className="text-muted-foreground">Supports receipts in multiple languages and formats.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}