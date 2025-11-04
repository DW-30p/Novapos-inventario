import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, CheckCircle2 } from "lucide-react";

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

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setLastScanned(decodedText);
          setScanSuccess(true);
          onScanSuccess(decodedText);
          
          setTimeout(() => {
            setScanSuccess(false);
          }, 2000);
        },
        () => {
          // Error callback - silently ignore
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Escanear Código de Barras</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-scanner"
            >
              <CameraOff className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <div
              id="barcode-reader"
              className="rounded-md overflow-hidden border-2 border-border"
              style={{ minHeight: "300px" }}
            />
            
            {scanSuccess && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-md">
                <div className="bg-background/95 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <p className="text-lg font-medium">¡Escaneado!</p>
                  <p className="font-mono text-sm text-muted-foreground">{lastScanned}</p>
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
            <Button
              onClick={handleClose}
              variant="outline"
              size="lg"
              data-testid="button-cancel-scanner"
            >
              Cancelar
            </Button>
          </div>

          {lastScanned && (
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
