import { useState, useMemo } from "react";
import { type Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Package, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function ProductList({ products, onEdit, onDelete, isLoading }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryName).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = products.filter((product) => {
    // Text search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || (
      product.name.toLowerCase().includes(search) ||
      product.barcode?.toLowerCase().includes(search) ||
      product.categoryName?.toLowerCase().includes(search)
    );

    // Category filter
    const matchesCategory = categoryFilter === "all" || 
      (categoryFilter === "uncategorized" && !product.categoryName) ||
      product.categoryName === categoryFilter;

    // Stock status filter
    let matchesStockStatus = true;
    if (stockStatusFilter === "in-stock") {
      matchesStockStatus = product.stock > product.minStock;
    } else if (stockStatusFilter === "low-stock") {
      matchesStockStatus = product.stock <= product.minStock && product.stock > 0;
    } else if (stockStatusFilter === "out-of-stock") {
      matchesStockStatus = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin Stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Stock Bajo", variant: "secondary" as const };
    return { label: "En Stock", variant: "default" as const };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Productos ({filteredProducts.length} de {products.length})</CardTitle>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código de barras o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="uncategorized">Sin categoría</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex-1">
              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger data-testid="select-stock-filter">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="in-stock">En Stock</SelectItem>
                  <SelectItem value="low-stock">Stock Bajo</SelectItem>
                  <SelectItem value="out-of-stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="rounded-full bg-muted p-6">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">
                  {searchTerm ? "No se encontraron productos" : "No hay productos"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Intenta buscar con otros términos"
                    : "Comienza agregando tu primer producto"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.minStock);
                    return (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium" data-testid={`text-name-${product.id}`}>
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded" data-testid={`text-barcode-${product.id}`}>
                            {product.barcode || "—"}
                          </code>
                        </TableCell>
                        <TableCell data-testid={`text-category-${product.id}`}>
                          {product.categoryName || "—"}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-price-${product.id}`}>
                          ${Number(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-stock-${product.id}`}>
                          {product.stock}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant} data-testid={`badge-status-${product.id}`}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(product.id)}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
