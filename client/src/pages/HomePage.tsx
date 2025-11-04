import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Product, type InsertProduct } from "@shared/schema";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { ExportPanel } from "@/components/ExportPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Package, TrendingDown, DollarSign, Layers } from "lucide-react";

export default function HomePage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto creado",
        description: "El producto se agregó correctamente al inventario",
      });
      setScannedBarcode("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertProduct }) => {
      return await apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto actualizado",
        description: "Los cambios se guardaron correctamente",
      });
      setEditingProduct(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    },
  });

  const handleScanSuccess = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScannerOpen(false);
    toast({
      title: "Código escaneado",
      description: `Código de barras: ${barcode}`,
    });
  };

  const handleSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setScannedBarcode("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sistema de Inventario</h1>
              <p className="text-sm text-muted-foreground">
                Gestión de productos con escaneo de códigos de barras
              </p>
            </div>
            <Button
              onClick={() => setIsScannerOpen(true)}
              size="lg"
              data-testid="button-scan-barcode"
            >
              <Plus className="mr-2 h-5 w-5" />
              Escanear Código
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-3xl font-bold" data-testid="text-total-products">
                    {totalProducts}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Bajo</p>
                  <p className="text-3xl font-bold text-secondary-foreground" data-testid="text-low-stock">
                    {lowStockCount}
                  </p>
                </div>
                <div className="rounded-full bg-secondary p-3">
                  <TrendingDown className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sin Stock</p>
                  <p className="text-3xl font-bold text-destructive" data-testid="text-out-of-stock">
                    {outOfStockCount}
                  </p>
                </div>
                <div className="rounded-full bg-destructive/10 p-3">
                  <Layers className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold" data-testid="text-total-value">
                    ${totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Form */}
        <div>
          {editingProduct && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Editando: {editingProduct.name}</h2>
              <Button variant="outline" onClick={handleCancelEdit} data-testid="button-cancel-edit">
                Cancelar Edición
              </Button>
            </div>
          )}
          <ProductForm
            onSubmit={handleSubmit}
            onOpenScanner={() => setIsScannerOpen(true)}
            initialData={editingProduct || undefined}
            isPending={createMutation.isPending || updateMutation.isPending}
            scannedBarcode={scannedBarcode}
          />
        </div>

        {/* Product List */}
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          isLoading={isLoading}
        />

        {/* Export Panel */}
        <ExportPanel products={products} />
      </main>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
