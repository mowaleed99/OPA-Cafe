import { Navigate } from 'react-router-dom';

// Categories are managed within the Products page (Products & Categories tabs)
export default function CategoriesPage() {
  return <Navigate to="/products" replace />;
}
