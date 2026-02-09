import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../common/Navbar";
import ProductDescription from "./ProductDescription";
import LoadingOverlay from "../common/LoadingOverlay";

import ProductGrid from "./ProductGrid";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchProductDetails,
  fetchSimilarProducts,
  fetchProductVariant,
  fetchSimilarProductVariants,
  fetchProductVariants,
  fetchProducts,
} from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import type { Product, ProductImage } from "../../types/product";
import { LOW_STOCK_THRESHOLD } from "../../constants/products";

const ProductDetails = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const {
    selectedProduct,
    selectedVariant,
    products,
    productVariants,
    loading: productsLoading,
    error,
  } = useAppSelector((state) => state.products);

  const { user, guestId } = useAppSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  const hasUserSelectedOption = useMemo(() => {
    if (!selectedProduct?.options) return false;

    return Object.keys(selectedProduct.options).some((key) => {
      const v = searchParams.get(key);
      return v !== null && v !== "";
    });
  }, [selectedProduct, searchParams]);

  const hasAllRequiredOptionsSelected = useMemo(() => {
    if (!selectedProduct?.options) return false;
    return Object.keys(selectedProduct.options).every((key) => {
      const v = searchParams.get(key);
      return v !== null && v !== "";
    });
  }, [selectedProduct, searchParams]);

  const displayName = useMemo(() => {
    if (hasAllRequiredOptionsSelected && selectedVariant?.name) {
      return selectedVariant.name;
    }
    return selectedProduct?.name ?? "";
  }, [
    hasAllRequiredOptionsSelected,
    selectedVariant?.name,
    selectedProduct?.name,
  ]);

  const displayedImages = useMemo(() => {
    const productImgs = selectedProduct?.images?.length
      ? selectedProduct.images
      : [];
    const variantImgs = selectedVariant?.images?.length
      ? selectedVariant.images
      : [];

    if (!hasUserSelectedOption) return productImgs;

    const variantIds = new Set(
      variantImgs.map((img: ProductImage) => img.publicId),
    );
    const merged = [
      ...variantImgs,
      ...productImgs.filter(
        (img: ProductImage) => !variantIds.has(img.publicId),
      ),
    ];

    return merged.length ? merged : productImgs;
  }, [selectedProduct, selectedVariant, hasUserSelectedOption]);

  // Don't show first image in product details
  const blockedProductFirstId = selectedProduct?.images?.[0]?.publicId || null;

  const carouselImages = useMemo(() => {
    if (!displayedImages?.length) return [];
    if (!blockedProductFirstId) return displayedImages;

    const filtered = displayedImages.filter(
      (img: ProductImage) => img.publicId !== blockedProductFirstId,
    );

    return filtered.length ? filtered : displayedImages;
  }, [displayedImages, blockedProductFirstId]);

  // Stock status
  const stockCount = selectedVariant?.countInStock;
  const isSoldOut = stockCount === 0;
  const isLowStock =
    typeof stockCount === "number" &&
    stockCount > 0 &&
    stockCount <= LOW_STOCK_THRESHOLD;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // curr product details
        await dispatch(fetchProductDetails({ id })).unwrap();

        // product variant (based on URL params)
        const color = searchParams.get("color") || undefined;
        const variant = searchParams.get("variant") || undefined;
        const ovenMitt = searchParams.get("ovenMitt") || undefined;
        const stabiliser = searchParams.get("stabiliser") || undefined;

        await dispatch(
          fetchProductVariant({
            productId: id,
            color,
            variant,
            ovenMitt,
            stabiliser,
          }),
        ).unwrap();

        const all = await dispatch(fetchProducts()).unwrap();
        const listed = all.filter((p: Product) => p.isListed && p._id !== id);
        const ids = listed.map((p: Product) => p._id);

        if (ids.length > 0) {
          await dispatch(fetchProductVariants({ productIds: ids })).unwrap();
        }

        // similar products
        const similarProds = await dispatch(
          fetchSimilarProducts({ id }),
        ).unwrap();
        const productIds = (similarProds ?? []).map((p: Product) => p._id);

        if (productIds.length > 0) {
          await dispatch(fetchSimilarProductVariants({ productIds })).unwrap();
        }
      } catch (err) {
        console.error("ProductDetails load failed: ", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, id, searchParams]);

  const lastVariantIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!carouselImages.length) return;

    const variantId = selectedVariant?._id ?? null;

    if (!hasUserSelectedOption) {
      lastVariantIdRef.current = null;

      const exists = carouselImages.some(
        (img: ProductImage) => img.publicId === mainImage,
      );
      if (!mainImage || !exists) {
        setMainImage(carouselImages[0].publicId);
      }
      return;
    }

    if (variantId && variantId !== lastVariantIdRef.current) {
      const vImgs = selectedVariant?.images || [];

      const variantPick =
        vImgs.find(
          (img: ProductImage) => img.publicId !== blockedProductFirstId,
        )?.publicId || "";

      if (variantPick) {
        setMainImage(variantPick);
      } else {
        setMainImage(carouselImages[0].publicId);
      }

      lastVariantIdRef.current = variantId;
      return;
    }

    const exists = carouselImages.some(
      (img: ProductImage) => img.publicId === mainImage,
    );
    if (!mainImage || !exists) {
      setMainImage(carouselImages[0].publicId);
    }
  }, [
    carouselImages,
    hasUserSelectedOption,
    selectedVariant?._id,
    selectedVariant?.images,
    mainImage,
  ]);

  const handleQuantityChange = (action: "incr" | "decr") => {
    if (action === "incr") setQuantity((prev) => prev + 1);
    if (action === "decr") setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const pickNoStabiliserValue = (values: string[]) => {
    const preferred = values.find((v) => {
      const s = v.toLowerCase();
      return s.includes("no");
    });

    return preferred ?? values[0];
  };

  const handleOptionSelect = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);

    if (key === "color" && selectedProduct?.options?.stabiliser) {
      const currentStab = newParams.get("stabiliser");
      if (!currentStab) {
        const stabValues = selectedProduct.options.stabiliser;
        const noStab = pickNoStabiliserValue(stabValues);
        newParams.set("stabiliser", noStab);
      }
    }

    setSearchParams(newParams);
  };

  const handleAddToCart = () => {
    if (!id) {
      toast.error("Invalid product ID.");
      return;
    }

    if (!selectedVariant?._id) {
      toast.error("Please select a valid variant before adding to cart.", {
        duration: 1500,
      });
      return;
    }

    if (selectedProduct?.options) {
      const requiredKeys = Object.keys(selectedProduct.options);
      const missing = requiredKeys.filter((key) => !searchParams.get(key));
      if (missing.length > 0) {
        toast.error(
          `Please select ${missing.join(", ")} before adding to cart.`,
          { duration: 1500 },
        );
        return;
      }
    }

    setIsButtonDisabled(true);

    const finalOptions: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      finalOptions[key] = value;
    });

    dispatch(
      addToCart({
        productId: id,
        productVariantId: selectedVariant._id,
        quantity,
        options: finalOptions,
        guestId,
        userId: user?._id,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Product added to cart!", { duration: 1000 });
      })
      .catch(() => {
        toast.error("Failed to add to cart.", { duration: 1000 });
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  const getCurrentIndex = () => {
    if (!carouselImages.length) return 0;
    const idx = carouselImages.findIndex(
      (img: ProductImage) => img.publicId === mainImage,
    );
    return idx >= 0 ? idx : 0;
  };

  const goPrev = () => {
    if (!carouselImages.length) return;
    const curr = getCurrentIndex();
    const nextIndex =
      (curr - 1 + carouselImages.length) % carouselImages.length;
    setMainImage(carouselImages[nextIndex].publicId);
  };

  const goNext = () => {
    if (!carouselImages.length) return;
    const curr = getCurrentIndex();
    const nextIndex = (curr + 1) % carouselImages.length;
    setMainImage(carouselImages[nextIndex].publicId);
  };

  if (!selectedProduct) return null;

  const isProductReady = !!selectedProduct && selectedProduct._id === id;

  return (
    <>
      <Navbar />
      <LoadingOverlay show={loading} />

      <div className="p-6">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
          {error && <p className="mb-4 text-red-600">Error: {error}</p>}

          {!isProductReady ? (
            <div>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/2">
                  <div className="mb-4 w-full aspect-4/3 bg-gray-100 animate-pulse rounded" />
                  <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                </div>

                <div className="md:w-1/2">
                  <div className="h-8 w-3/4 bg-gray-100 animate-pulse rounded mb-4" />
                  <div className="h-6 w-1/3 bg-gray-100 animate-pulse rounded mb-6" />
                  <div className="h-10 w-full bg-gray-100 animate-pulse rounded mb-4" />
                  <div className="h-40 w-full bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row">
                {/* Images */}
                <div className="md:w-1/2">
                  {/* Main image */}
                  <div className="mb-4 relative w-full aspect-square overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={
                        mainImage ? cloudinaryImageUrl(mainImage) : undefined
                      }
                      alt={displayName}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "50% 50%" }}
                    />

                    {carouselImages.length > 1 && (
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
                      >
                        ‹
                      </button>
                    )}

                    {carouselImages.length > 1 && (
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
                      >
                        ›
                      </button>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex overflow-x-auto gap-4">
                    {carouselImages.map(
                      (image: ProductImage, index: number) => (
                        <img
                          key={image.publicId ?? index}
                          src={cloudinaryImageUrl(image.publicId)}
                          alt={image.alt || `Thumbnail ${index}`}
                          className={`w-20 h-20 object-cover cursor-pointer border shrink-0 ${
                            mainImage === image.publicId
                              ? "border-black"
                              : "border-gray-200"
                          }`}
                          onClick={() => setMainImage(image.publicId)}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Right side - Details */}
                <div className="md:w-1/2 md:ml-10">
                  <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-acloblue">
                    {displayName}
                  </h1>

                  {/* Price Display */}
                  <div className="mb-2">
                    {selectedVariant?.discountPrice ? (
                      <>
                        <span className="text-xl font-medium text-acloblue mr-6">
                          IDR {selectedVariant.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          IDR {selectedVariant.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl text-gray-800">
                        IDR{" "}
                        {(selectedVariant?.price ?? "")
                          ? selectedVariant?.price?.toLocaleString()
                          : "Price Not Available"}
                      </span>
                    )}
                    {isLowStock && (
                      <p className="text-md text-yellow-500 font-medium">
                        Low stock
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  {!!selectedProduct.options &&
                    Object.entries(selectedProduct.options).map(
                      ([key, values]) => (
                        <div className="mb-4" key={key}>
                          <p className="text-sm font-medium text-gray-900 capitalize mb-2">
                            {key}:{" "}
                            <span className="text-gray-500 font-normal">
                              {searchParams.get(key)}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {values.map((value: string) => {
                              const isSelected =
                                searchParams.get(key) === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => handleOptionSelect(key, value)}
                                  className={`px-4 py-2 rounded-md border text-sm transition-all duration-200 ${
                                    isSelected
                                      ? "bg-acloblue text-white border-acloblue shadow-md"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                  }`}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <p className="text-gray-700">Quantity:</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => handleQuantityChange("decr")}
                        className="px-2.5 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange("incr")}
                        className="px-2 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled || isSoldOut}
                    className={`bg-acloblue text-white py-2 px-6 rounded w-full mb-2 ${
                      isButtonDisabled || isSoldOut
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-acloblue hover:opacity-50"
                    }`}
                  >
                    {isButtonDisabled ? "Processing..." : "ADD TO CART"}
                  </button>
                  {isSoldOut && (
                    <p className="text-left text-md text-red-600 font-semibold">
                      Sold out
                    </p>
                  )}

                  <ProductDescription md={selectedProduct.description} />
                </div>
              </div>

              {/* Similar products */}
              <div className="mt-20 text-center">
                <h2 className="text-2xl font-medium">Buy more, save 5%</h2>
                <p className="mt-1 text-md text-gray-500">
                  Unlock 5% off when your cart hits IDR 1.500.000+
                </p>

                <div className="mt-4">
                  <ProductGrid
                    products={products.filter(
                      (p) => p.isListed && p._id !== id,
                    )}
                    productVariants={productVariants}
                    loading={productsLoading}
                    error={error}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
