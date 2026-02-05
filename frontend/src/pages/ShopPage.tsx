import { useEffect, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchProducts,
  fetchProductVariants,
} from "../redux/slices/productsSlice";
import Navbar from "../components/common/Navbar";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";

const PROMO_MIN_SPEND = 1_500_000;
const PROMO_DISCOUNT_PCT = 5;

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
    (p) => p.category === "Utensils" || p.category === "Accessories",
  );

  const heroImgSrc = cloudinaryImageUrl(assets.story.story_1.publicId);

  return (
    <div>
      <Navbar />
      <LoadingOverlay show={loading} />

      <section>
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[200px] sm:h-[260px] lg:h-[320px]">
            {heroImgSrc ? (
              <img
                src={heroImgSrc}
                alt="Promo"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 70%" }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100" />
            )}

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
              <div className="w-full">
                <div className="max-w-xl rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
                    Special Offer
                  </p>

                  <p className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
                    Spend{" "}
                    <span className="underline decoration-lightbrown decoration-4 underline-offset-4">
                      IDR {PROMO_MIN_SPEND.toLocaleString("id-ID")}+
                    </span>{" "}
                    and enjoy{" "}
                    <span className="text-acloblue">
                      {PROMO_DISCOUNT_PCT}% OFF
                    </span>{" "}
                    at checkout.
                  </p>

                  <p className="mt-2 text-sm text-ink/70">
                    Discount is auto-applied - mix & match your favourites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none h-6 w-full bg-gradient-to-b from-black/0 to-white" />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row">
        <div className="grow p-4 px-10">
          <div id="products" className="h-1" />

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
