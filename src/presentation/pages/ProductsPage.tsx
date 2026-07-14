import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductsTab } from '../features/products/ProductsTab';
import { CategoriesTab } from '../features/products/CategoriesTab';
import { PageLayout, PageHeader, PageContent } from '../components/ui/page-layout';

export default function ProductsPage() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <PageHeader title={t('products_menu')} description={t('manage_products_desc', 'Manage your catalog')} />
      <PageContent>
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="products">{t('tab_products')}</TabsTrigger>
            <TabsTrigger value="categories">{t('tab_categories')}</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageLayout>
  );
}
