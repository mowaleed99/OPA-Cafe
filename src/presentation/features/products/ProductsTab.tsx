import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PlusCircle, Pencil, Trash2, Search, Coffee } from 'lucide-react';
import type { Product } from '../../../core/entities/product';
import type { Category } from '../../../core/entities/category';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { getProducts, softDeleteProduct } from '../../../application/useCases/products/manageProducts';
import { getCategories } from '../../../application/useCases/products/manageCategories';
import { ProductFormModal } from './ProductFormModal';

export function ProductsTab() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const cafeId = useAuthStore(state => state.cafeId());

  const loadData = async () => {
    if (!cafeId) return;
    const [prods, cats] = await Promise.all([
      getProducts(cafeId),
      getCategories(cafeId)
    ]);
    setProducts(prods);
    setCategories(cats);
  };

  useEffect(() => {
    loadData();
  }, [cafeId]);

  const handleAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      await softDeleteProduct(product);
      loadData();
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered products by category
  const groupedProducts: Record<string, Product[]> = {};
  categories.forEach(c => {
    groupedProducts[c.id] = [];
  });
  const uncategorized: Product[] = [];

  filtered.forEach(p => {
    if (p.category_id && groupedProducts[p.category_id]) {
      groupedProducts[p.category_id].push(p);
    } else {
      uncategorized.push(p);
    }
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_products')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="space-y-8">
        {categories.map(category => {
          const categoryProducts = groupedProducts[category.id] || [];
          if (categoryProducts.length === 0 && searchQuery) return null; // hide empty categories when searching
          
          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Coffee className="h-5 w-5 text-brand-bean dark:text-brand-latte" />
                <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                  {categoryProducts.length}
                </span>
              </div>
              
              {categoryProducts.length > 0 ? (
                <div className="border rounded-md bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="w-[100px]">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.price.toFixed(2)} EGP</TableCell>
                          <TableCell>{product.cost.toFixed(2)} EGP</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic pl-2">No products in this category.</p>
              )}
            </div>
          );
        })}

        {uncategorized.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <Coffee className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Uncategorized</h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                {uncategorized.length}
              </span>
            </div>
            <div className="border rounded-md bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="w-[100px]">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uncategorized.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price.toFixed(2)} EGP</TableCell>
                      <TableCell>{product.cost.toFixed(2)} EGP</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-card border-dashed">
            <p className="text-muted-foreground">
              {searchQuery ? 'No products match your search.' : 'No products found. Click "Add Product" to create one.'}
            </p>
          </div>
        )}
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productToEdit={productToEdit}
        onSaved={loadData}
      />
    </div>
  );
}
