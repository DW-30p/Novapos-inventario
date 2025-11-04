import { type Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Database, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  products: Product[];
}

export function ExportPanel({ products }: ExportPanelProps) {
  const { toast } = useToast();

  const exportToExcel = async () => {
    try {
      // Dynamically import xlsx to reduce initial bundle size
      const XLSX = await import("xlsx");
      
      const worksheet = XLSX.utils.json_to_sheet(
        products.map((p) => ({
          ID: p.id,
          Nombre: p.name,
          "Código de Barras": p.barcode || "",
          Categoría: p.categoryName || "",
          Descripción: p.description || "",
          Precio: Number(p.price),
          Costo: p.cost ? Number(p.cost) : "",
          Stock: p.stock,
          "Stock Mínimo": p.minStock,
          "Fecha Creación": new Date(p.createdAt).toLocaleString("es-ES"),
          "Fecha Actualización": new Date(p.updatedAt).toLocaleString("es-ES"),
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `inventario_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      toast({
        title: "Exportación exitosa",
        description: `Se descargó el archivo ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  const exportToSQL = () => {
    try {
      const sqlStatements = products.map((p) => {
        const name = p.name.replace(/'/g, "''");
        const barcode = p.barcode ? `'${p.barcode.replace(/'/g, "''")}'` : "NULL";
        const description = p.description ? `'${p.description.replace(/'/g, "''")}'` : "NULL";
        const categoryName = p.categoryName ? `'${p.categoryName.replace(/'/g, "''")}'` : "NULL";
        const cost = p.cost ? Number(p.cost) : "NULL";

        return `INSERT INTO inventory_products (name, barcode, description, price, cost, stock, min_stock, category_name) 
VALUES ('${name}', ${barcode}, ${description}, ${Number(p.price)}, ${cost}, ${p.stock}, ${p.minStock}, ${categoryName});`;
      });

      const sqlContent = `-- Exportación de productos del inventario
-- Fecha: ${new Date().toLocaleString("es-ES")}
-- Total de productos: ${products.length}

${sqlStatements.join("\n\n")}`;

      // Create and download the SQL file
      const blob = new Blob([sqlContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `inventario_${timestamp}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: `Se descargó el archivo SQL con ${products.length} productos`,
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo SQL",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exporta todos los productos ({products.length}) a diferentes formatos para usar en otros sistemas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="h-auto flex-col gap-3 py-6"
            disabled={products.length === 0}
            data-testid="button-export-excel"
          >
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">Exportar a Excel</div>
              <div className="text-xs text-muted-foreground">
                Archivo .xlsx con todos los datos
              </div>
            </div>
          </Button>

          <Button
            onClick={exportToSQL}
            variant="outline"
            className="h-auto flex-col gap-3 py-6"
            disabled={products.length === 0}
            data-testid="button-export-sql"
          >
            <Database className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">Exportar a SQL</div>
              <div className="text-xs text-muted-foreground">
                INSERT statements para importar
              </div>
            </div>
          </Button>
        </div>

        {products.length === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Agrega productos para poder exportarlos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
