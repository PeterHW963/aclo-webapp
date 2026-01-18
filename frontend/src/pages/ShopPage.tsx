import { useEffect, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchProducts,
  fetchProductVariants,
} from "../redux/slices/productsSlice";
import Navbar from "../components/common/Navbar";
import LoadingOverlay from "../components/common/LoadingOverlay";

const ShopPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  const {
    products,
    productVariants,
    loading: productsLoading,
    error,
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const products = await dispatch(fetchProducts()).unwrap();
        const listed = products.filter((p) => p.isListed);
        const ids = listed.map((p) => p._id);

        if (ids.length > 0) {
          await dispatch(fetchProductVariants({ productIds: ids })).unwrap();
        }
      } catch (error) {
        console.error("Failed to fetch initial products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const listed = products.filter((p) => p.isListed);

  const towers = listed.filter((p) => p.category === "Learning Tower");

  const others = listed.filter(
    (p) => p.category === "Utensils" || p.category === "Accessories"
  );

  return (
    <div>
      <Navbar />
      <LoadingOverlay show={loading} />
      <div className="flex flex-col lg:flex-row">
        <div className="grow p-4 px-10">
          <h2 className="text-4xl mb-8 text-center text-acloblue">
            All products
          </h2>

          <p className="text-2xl text-ink font-extralight p-4">
            Learning towers
          </p>
          <ProductGrid
            products={towers}
            productVariants={productVariants}
            loading={productsLoading}
            error={error}
          />

          <p className="text-2xl mt-12 text-ink font-extralight p-4">
            Kids' kitchen tools & accessories
          </p>
          <ProductGrid
            products={others}
            productVariants={productVariants}
            loading={productsLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
