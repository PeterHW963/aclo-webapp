import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import {
  deleteProduct,
  updateProductVariant,
} from "../slices/adminProductSlice";
import {
  fetchProducts,
  fetchProductVariantsBulk,
} from "../../products/slices/productsSlice";

import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";
import type { ProductVariant } from "../../../shared/types/productVariant";

import ChangePriceModal from "../components/ChangePriceModal";
import ActionConfirmationModal from "../components/ActionConfirmationModal";
import LoadingOverlay from "../../../shared/components/common/LoadingOverlay";

import useMediaQuery from "@mui/material/useMediaQuery";

const ProductManagement = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { user } = useAppSelector((state) => state.auth);
  const {
    products,
    productVariants,
    loading: productLoading,
    error,
  } = useAppSelector((state) => state.products);

  const [priceModalOpen, setPriceModalOpen] = useState<boolean>(false);
  const [actionConfirmationModalOpen, setActionConfirmationModalOpen] =
    useState<boolean>(false);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [activeProductName, setActiveProductName] = useState("");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeVariants, setActiveVariants] = useState<ProductVariant[]>([]);

  const openChangePrice = (
    productId: string,
    variantId: string,
    productName: string,
    variants: ProductVariant[],
  ) => {
    setActiveProductId(productId);
    setActiveVariantId(variantId);
    setActiveProductName(productName);
    setActiveVariants(variants);
    setPriceModalOpen(true);
  };

  const closeChangePrice = () => {
    setActiveProductId(null);
    setActiveVariantId(null);
    setPriceModalOpen(false);
    setActiveVariants([]);
  };

  const openDeleteConfirmation = (productId: string) => {
    setActiveProductId(productId);
    setActionConfirmationModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setActiveProductId(null);
    setActionConfirmationModalOpen(false);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const prods = await dispatch(fetchProducts()).unwrap();
        const ids = prods.map((p) => p._id);

        if (ids.length > 0) {
          await dispatch(
            fetchProductVariantsBulk({ productIds: ids }),
          ).unwrap();
        }
      } catch (err) {
        console.error("Failed to load products: ", err);
        toast.error("Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate, user]);

  const handleDelete = async (productId: string) => {
    // (you already have a nicer confirmation modal; keep window.confirm out)
    // if (!window.confirm("Are you sure you want to delete the Product?")) return;

    setLoading(true);
    try {
      await dispatch(deleteProduct(productId)).unwrap();

      const prods = await dispatch(fetchProducts()).unwrap();
      const ids = prods.map((p) => p._id);
      if (ids.length > 0) {
        await dispatch(fetchProductVariantsBulk({ productIds: ids })).unwrap();
      }

      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // prevent double "Loading..."
  const isFullyLoaded =
    products.length > 0 &&
    products.every((p) => (productVariants[p._id]?.length ?? 0) > 0);

  const showLoading = loading || productLoading || !isFullyLoaded;
  if (error) return <p>Error: {error}</p>;

  const MobileProductCard = ({
    product,
  }: {
    product: (typeof products)[number];
  }) => {
    const allVariants = productVariants[product._id] || [];
    const defaultVariant =
      allVariants.find((v) => v.isDefault) || allVariants[0];
    const displayPrice = defaultVariant?.discountPrice ?? defaultVariant?.price;

    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <img
            src={cloudinaryImageUrl(defaultVariant?.images?.[0]?.publicId)}
            alt={product.name}
            className="h-14 w-14 rounded-lg object-cover border"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">Product</p>
            <p className="font-semibold text-gray-900 truncate">
              {product.name}
            </p>

            <p className="mt-2 text-xs text-gray-500">Price</p>
            <p className="text-sm font-semibold text-acloblue">
              {displayPrice
                ? `IDR ${displayPrice.toLocaleString("id-ID")}`
                : "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {defaultVariant && (
            <>
              <Link
                to={`/admin/products/${product._id}/edit/${defaultVariant._id}`}
                className="px-4 py-2 rounded-md text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={() => openDeleteConfirmation(product._id)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() =>
                  openChangePrice(
                    product._id,
                    defaultVariant._id,
                    product.name,
                    allVariants,
                  )
                }
                className="px-4 py-2 rounded-md text-sm font-medium bg-acloblue text-white hover:opacity-90 cursor-pointer"
              >
                Quick Change
              </button>

              <Link
                to={`/admin/products/${product._id}/edit/${defaultVariant._id}`}
                className="ml-auto text-sm font-medium text-blue-600 hover:underline self-center"
              >
                View →
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <LoadingOverlay show={showLoading} />

      {actionConfirmationModalOpen && activeProductId && (
        <ActionConfirmationModal
          loading={productLoading}
          onClose={closeDeleteConfirmation}
          onConfirm={() => handleDelete(activeProductId)}
          title="Confirm Delete Product"
          message={`Are you sure you want to delete this product? This action will also delete all the product's variants.\n**WARNING: this action cannot be undone.**`}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Product Management</h2>

        {isMobile ? (
          <div className="space-y-3">
            {products.length > 0 ? (
              products.map((product) => (
                <MobileProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">
                No products found.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="min-w-full text-left text-gray-500">
              <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Price (IDR)</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const allVariants = productVariants[product._id] || [];
                    const defaultVariant =
                      allVariants.find((v) => v.isDefault) || allVariants[0];
                    const displayPrice =
                      defaultVariant?.discountPrice ?? defaultVariant?.price;

                    return (
                      <tr
                        key={product._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <img
                            src={cloudinaryImageUrl(
                              defaultVariant?.images?.[0]?.publicId,
                            )}
                            alt={product.name}
                            className="w-12 h-12 object-cover"
                          />
                        </td>

                        <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                          {product.name}
                        </td>

                        <td className="p-4">
                          {displayPrice
                            ? displayPrice.toLocaleString("id-ID")
                            : ""}
                        </td>

                        <td className="p-4">
                          {defaultVariant && (
                            <>
                              <Link
                                to={`/admin/products/${product._id}/edit/${defaultVariant._id}`}
                                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteConfirmation(product._id)
                                }
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 cursor-pointer"
                              >
                                Delete
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openChangePrice(
                                    product._id,
                                    defaultVariant._id,
                                    product.name,
                                    allVariants,
                                  )
                                }
                                className="bg-acloblue text-white px-4 py-2 rounded mr-2 hover:opacity-90 cursor-pointer"
                              >
                                Quick Change
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeVariantId && priceModalOpen && (
          <ChangePriceModal
            productName={activeProductName}
            variants={activeVariants}
            initialVariantId={activeVariantId}
            onClose={closeChangePrice}
            onSave={async ({
              variantId,
              price,
              discountPrice,
              countInStock,
            }) => {
              if (!activeVariantId || !activeProductId) return;

              try {
                await dispatch(
                  updateProductVariant({
                    productId: activeProductId,
                    variantId,
                    variantData: { price, discountPrice, countInStock },
                  }),
                ).unwrap();

                const prods = await dispatch(fetchProducts()).unwrap();
                const ids = prods.map((p) => p._id);
                if (ids.length > 0) {
                  await dispatch(
                    fetchProductVariantsBulk({ productIds: ids }),
                  ).unwrap();
                }

                toast.success("Product updated");
              } catch (err: any) {
                toast.error(err?.message ?? "Failed to update product");
              }
            }}
          />
        )}
      </div>
    </>
  );
};

export default ProductManagement;
