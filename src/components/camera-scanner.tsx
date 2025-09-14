import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Tesseract from 'tesseract.js';

interface ScannedData {
  storeName?: string;
  amount?: number;
  items?: string[];
  rawText: string;
}

interface CameraScannerProps {
  onScanComplete: (data: ScannedData) => void;
  onClose: () => void;
}

export function CameraScanner({ onScanComplete, onClose }: CameraScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      console.log('Processing image with OCR...');
      
      // Check if Google Vision API key is available
      const googleApiKey = localStorage.getItem("googleApiKey");
      
      let extractedText = "";
      
      if (googleApiKey) {
        // Use Google Vision API for better accuracy
        try {
          toast({
            title: "Processing Receipt",
            description: "Using Google Vision API for enhanced accuracy...",
          });

          const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [{
                image: {
                  content: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
                },
                features: [
                  { type: 'TEXT_DETECTION' },
                  { type: 'DOCUMENT_TEXT_DETECTION' }
                ]
              }]
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Vision API HTTP Error:', response.status, errorData);
            throw new Error(`Google Vision API HTTP error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
          }
          
          const result = await response.json();
          console.log('Google Vision API Response:', result);
          
          if (result.responses?.[0]?.fullTextAnnotation?.text) {
            extractedText = result.responses[0].fullTextAnnotation.text;
            console.log('Google Vision API Text:', extractedText);
          } else if (result.responses?.[0]?.error) {
            console.error('Google Vision API Response Error:', result.responses[0].error);
            throw new Error(`Google Vision API error: ${result.responses[0].error.message}`);
          } else {
            console.log('No text detected by Google Vision API, trying Tesseract...');
            throw new Error('No text detected by Google Vision API');
          }
        } catch (visionError) {
          console.error('Google Vision API failed, falling back to Tesseract:', visionError);
          toast({
            title: "API Processing Failed",
            description: `Google Vision API error: ${visionError.message}. Using basic OCR...`,
            variant: "destructive",
          });
          
          // Fall back to Tesseract
          const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log('Tesseract progress:', m);
              }
            }
          });
          extractedText = text;
        }
      } else {
        // Use Tesseract OCR as fallback
        toast({
          title: "Processing Receipt",
          description: "Extracting text from your receipt...",
        });
        
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log('Tesseract progress:', m);
            }
          }
        });
        extractedText = text;
        
        toast({
          title: "Using Basic OCR",
          description: "Add Google Vision API key in settings for better accuracy.",
        });
      }
      
      console.log('Extracted Text:', extractedText);
      
      const parsedData = parseReceiptText(extractedText);
      console.log('Parsed Data:', parsedData);
      
      toast({
        title: "Receipt Scanned Successfully!",
        description: `Found ${parsedData.storeName || 'store'} with amount ${parsedData.amount ? `$${parsedData.amount}` : 'detected'}`,
      });
      
      onScanComplete(parsedData);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseReceiptText = (text: string): ScannedData => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Common store name patterns
    const storePatterns = [
      /^(.*?)(store|shop|market|mall|restaurant|cafe|hotel)/i,
      /^([A-Z][a-z]+\s*[A-Z]*[a-z]*)\s/,
      /^(BIG\s*BAZAAR|RELIANCE|MORE|DMART|SPENCER|LIFESTYLE|WESTSIDE|PANTALOONS)/i,
      /^(SWIGGY|ZOMATO|UBER\s*EATS|DOMINOS|PIZZA\s*HUT|KFC|MCDONALD)/i
    ];

    // Amount patterns (₹, Rs, INR, USD, $)
    const amountPatterns = [
      /(?:₹|Rs\.?|INR|TOTAL|AMOUNT)\s*:?\s*([0-9,]+\.?[0-9]*)/i,
      /TOTAL\s*:?\s*([0-9,]+\.?[0-9]*)/i,
      /\$\s*([0-9,]+\.?[0-9]*)/,
      /([0-9,]+\.[0-9]{2})\s*(?:₹|Rs|INR|TOTAL)/i,
      /([0-9,]+)\s*(?:₹|Rs|INR)/i
    ];

    // Item patterns
    const itemPatterns = [
      /^\d+\.\s*(.+?)\s+[₹$Rs]?[0-9,]+/,
      /^(.+?)\s+(?:x\d+)?\s+[₹$Rs]?[0-9,]+/,
      /^(.+?)\s+[₹$Rs]?[0-9,]+\.?[0-9]*$/
    ];

    let storeName: string | undefined;
    let amount: number | undefined;
    const items: string[] = [];

    // Extract store name (usually in first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      for (const pattern of storePatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          storeName = match[1].trim().replace(/[^a-zA-Z0-9\s]/g, '');
          break;
        }
      }
      if (storeName) break;
    }

    // Extract total amount
    for (const line of lines) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const numStr = match[1].replace(/,/g, '');
          const num = parseFloat(numStr);
          if (!isNaN(num) && num > 0) {
            amount = num;
            break;
          }
        }
      }
      if (amount) break;
    }

    // Extract items
    for (const line of lines) {
      // Skip lines that are likely headers, totals, or store info
      if (line.match(/total|amount|₹|tax|cgst|sgst|discount|phone|address|thank|visit/i)) {
        continue;
      }
      
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          const item = match[1].trim().replace(/[^a-zA-Z0-9\s]/g, '');
          if (item && !items.includes(item)) {
            items.push(item);
          }
        }
      }
    }

    // Fallback: if no structured parsing worked, try to find obvious patterns
    if (!storeName) {
      const firstLine = lines[0] || '';
      if (firstLine.length > 3 && firstLine.length < 50) {
        storeName = firstLine.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      }
    }

    if (!amount) {
      // Look for any number that looks like currency
      for (const line of lines) {
        const numbers = line.match(/([0-9,]+\.?[0-9]*)/g);
        if (numbers) {
          for (const numStr of numbers) {
            const num = parseFloat(numStr.replace(/,/g, ''));
            if (!isNaN(num) && num > 10 && num < 100000) { // Reasonable range
              amount = num;
              break;
            }
          }
        }
        if (amount) break;
      }
    }

    return {
      storeName,
      amount,
      items: items.slice(0, 10), // Limit to 10 items
      rawText: text
    };
  };

  return (
    <Card className="p-6 card-beautiful">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Scan Receipt</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!showCamera && !capturedImage && (
        <div className="space-y-4">
          <div className="text-center">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">
              Take a photo of your receipt or upload an image to extract expense details automatically.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={startCamera} className="button-glow">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none">
              <div className="absolute inset-4 border border-primary rounded-lg"></div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={capturePhoto} className="flex-1 button-glow">
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {capturedImage && !isProcessing && (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => processImage(capturedImage)} 
              className="flex-1 button-glow"
            >
              <Upload className="h-4 w-4 mr-2" />
              Process Receipt
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCapturedImage(null)}
            >
              Retake
            </Button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your receipt...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}