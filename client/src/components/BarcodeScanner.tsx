import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, isOpen, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const scannerIdRef = useRef<string>("barcode-reader");
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = async () => {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        
        // Check if scanner is actually scanning before trying to stop
        if (scanner.isScanning) {
          await scanner.stop();
        }
        
        // Clear the scanner instance
        await scanner.clear();
        scannerRef.current = null;
      }
      
      if (isMountedRef.current) {
        setIsScanning(false);
        setError("");
      }
    } catch (err) {
      console.error("Error during cleanup:", err);
    }
  };

  // Initialize scanner when dialog opens
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (isMountedRef.current && !scannerRef.current) {
          try {
            const scanner = new Html5Qrcode(scannerIdRef.current, {
              formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.DATA_MATRIX,
              ],
              verbose: false,
            });
            scannerRef.current = scanner;
            
            // Auto-start scanning when dialog opens
            startScanning();
          } catch (err) {
            console.error("Error initializing scanner:", err);
            setError("No se pudo inicializar el escáner");
          }
        }
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      setError("");
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 30, // Aumentado de 10 a 30 para escaneo más rápido
          qrbox: { width: 300, height: 200 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          // Success callback
          if (!isMountedRef.current) return;
          
          setLastScanned(decodedText);
          setScanSuccess(true);
          onScanSuccess(decodedText);
          
          // Auto-close after successful scan
          setTimeout(() => {
            if (isMountedRef.current) {
              setScanSuccess(false);
              handleClose();
            }
          }, 1500);
        },
        (errorMessage) => {
          // Error callback - silently ignore decoding errors
          // These are normal when no barcode is in view
        }
      );
      
      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      if (isMountedRef.current) {
        setError(
          err instanceof Error 
            ? err.message 
            : "No se pudo acceder a la cámara. Verifica los permisos."
        );
      }
    }
  };

  const stopScanning = async () => {
    if (!scannerRef.current?.isScanning) return;
    
    try {
      await scannerRef.current.stop();
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const handleClose = async () => {
    await cleanup();
    onClose();
  };

  const handleRetry = async () => {
    setError("");
    await stopScanning();
    setTimeout(() => {
      startScanning();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Escanear Código de Barras</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Soporta EAN-13, UPC, Code 128, QR y más formatos
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-scanner"
            >
              <CameraOff className="h-5 w-5" />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <div
              id={scannerIdRef.current}
              className="rounded-md overflow-hidden border-2 border-border bg-black"
              style={{ minHeight: "400px" }}
            />
            
            {scanSuccess && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-md animate-in fade-in duration-200">
                <div className="bg-background/95 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-12 w-12 text-primary animate-in zoom-in duration-200" />
                  <p className="text-lg font-medium">¡Escaneado exitosamente!</p>
                  <p className="font-mono text-sm text-muted-foreground">{lastScanned}</p>
                </div>
              </div>
            )}

            {isScanning && !scanSuccess && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[300px] h-[200px] border-2 border-primary rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="flex-1"
                size="lg"
                data-testid="button-start-scanning"
                disabled={!!error}
              >
                <Camera className="mr-2 h-5 w-5" />
                Iniciar Escaneo
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="secondary"
                className="flex-1"
                size="lg"
                data-testid="button-stop-scanning"
              >
                <CameraOff className="mr-2 h-5 w-5" />
                Detener Escaneo
              </Button>
            )}
            
            {error && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="lg"
              >
                Reintentar
              </Button>
            )}
            
            <Button
              onClick={handleClose}
              variant="outline"
              size="lg"
              data-testid="button-cancel-scanner"
            >
              Cerrar
            </Button>
          </div>

          {lastScanned && !scanSuccess && (
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm text-muted-foreground mb-1">Último código escaneado:</p>
              <p className="font-mono text-lg" data-testid="text-last-scanned">{lastScanned}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}