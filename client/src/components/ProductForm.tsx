import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save } from "lucide-react";

interface ProductFormProps {
  onSubmit: (data: InsertProduct) => void;
  onOpenScanner: () => void;
  initialData?: Product;
  isPending?: boolean;
  scannedBarcode?: string;
}

export function ProductForm({
  onSubmit,
  onOpenScanner,
  initialData,
  isPending,
  scannedBarcode,
}: ProductFormProps) {
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      barcode: "",
      description: "",
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: 0,
      categoryName: "",
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const values: InsertProduct = {
        name: initialData.name || "",
        barcode: initialData.barcode || "",
        description: initialData.description || "",
        price: initialData.price ? Number(initialData.price) : 0,
        cost: initialData.cost ? Number(initialData.cost) : undefined,
        stock: initialData.stock || 0,
        minStock: initialData.minStock || 0,
        categoryName: initialData.categoryName || "",
      };
      form.reset(values);
    } else {
      // Reset to empty form when switching to new product mode
      form.reset({
        name: "",
        barcode: "",
        description: "",
        price: 0,
        cost: undefined,
        stock: 0,
        minStock: 0,
        categoryName: "",
      });
    }
  }, [initialData, form]);

  // Update barcode field when scannedBarcode changes
  useEffect(() => {
    if (scannedBarcode) {
      form.setValue("barcode", scannedBarcode);
    }
  }, [scannedBarcode, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del producto"
                      {...field}
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Código de barras"
                        {...field}
                        value={field.value || ""}
                        className="font-mono"
                        data-testid="input-barcode"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onOpenScanner}
                      data-testid="button-open-scanner"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Categoría del producto"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del producto"
                      {...field}
                      value={field.value || ""}
                      rows={3}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-cost"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        data-testid="input-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        data-testid="input-min-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
                data-testid="button-save-product"
              >
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Guardando..." : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
