import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { deleteProduct } from "../../redux/slices/adminProductSlice";
import {
  fetchProducts,
  fetchProductVariants,
} from "../../redux/slices/productsSlice";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import ChangePriceModal from "./ChangePriceModal";
import type { ProductVariant } from "../../types/productVariant";

const ProductManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { products, productVariants, loading, error } = useAppSelector(
    (state) => state.products
  );

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [activeProductName, setActiveProductName] = useState("");
  const [activeVariants, setActiveVariants] = useState<ProductVariant[]>([]);

  const openChangePrice = (
    variantId: string,
    productName: string,
    variants: ProductVariant[]
  ) => {
    setActiveVariantId(variantId);
    setActiveProductName(productName);
    setActiveVariants(variants);
    setPriceModalOpen(true);
  };

  const closeChangePrice = () => {
    setPriceModalOpen(false);
    setActiveVariantId(null);
    setActiveVariants([]);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    const loadData = async () => {
      if (products.length > 0 && Object.keys(productVariants).length > 0) {
        return;
      }
      try {
        const products = await dispatch(fetchProducts()).unwrap();
        const ids = products.map((p) => p._id);

        if (ids.length > 0) {
          await dispatch(fetchProductVariants({ productIds: ids })).unwrap();
        }
      } catch (err) {
        console.error("Failed to load products: ", err);
      }
    };

    if (!loading) {
      loadData();
    }
  }, []);

  const handleDelete = (productId: string) => {
    if (window.confirm("Are you sure you want to delete the Product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  // prevent double "Loading..."
  const isFullyLoaded =
    products.length > 0 &&
    products.every((p) => (productVariants[p._id]?.length ?? 0) > 0);
  const showLoading = loading || !isFullyLoaded;
  if (showLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
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
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-4">
                      <img
                        src={cloudinaryImageUrl(
                          defaultVariant?.images?.[0]?.publicId
                        )}
                        alt={product.name}
                        className="w-12 h-12 object-cover"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="p-4">{displayPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <Link
                        to={`/admin/products/${product._id}/edit/${defaultVariant._id}`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChangePrice(
                            defaultVariant._id,
                            product.name,
                            allVariants
                          );
                        }}
                        className="bg-acloblue text-white px-4 py-2 rounded mr-2 hover:opacity-90 cursor-pointer"
                      >
                        Change Price
                      </button>
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
      {activeVariantId && (
        <ChangePriceModal
          isOpen={priceModalOpen}
          productName={activeProductName}
          variants={activeVariants}
          initialVariantId={activeVariantId}
          onClose={closeChangePrice}
          onSave={async ({ variantId, price, discountPrice }) => {
            console.log({ variantId, price, discountPrice });
          }}

          // TODO: actually update the price
        />
      )}
    </div>
  );
};

export default ProductManagement;
