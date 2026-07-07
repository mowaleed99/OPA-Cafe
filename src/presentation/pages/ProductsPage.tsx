import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductsTab } from '../features/products/ProductsTab';
import { CategoriesTab } from '../features/products/CategoriesTab';

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Inventory</h1>
      </div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
