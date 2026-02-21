import type { Product } from "../../../shared/types/product";
import type { ProductVariant } from "../../../shared/types/productVariant";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  productVariants: Record<string, ProductVariant[]>;
  loading: boolean;
  error: string | null;
};

const ProductGrid = ({
  products,
  productVariants,
  loading,
  error,
}: ProductGridProps) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 space-y-4">
      {products.map((product) => {
        // Pass only the variants relevant to this specific product
        const variants = productVariants[product._id] || [];
        return (
          <ProductCard
            key={product._id}
            product={product}
            variants={variants}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
