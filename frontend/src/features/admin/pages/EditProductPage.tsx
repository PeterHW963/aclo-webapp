import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import {
  fetchProductDetails,
  fetchProductVariants,
} from "../../products/slices/productsSlice";
import {
  updateProduct,
  updateProductVariant,
} from "../slices/adminProductSlice";

import { API_URL } from "../../../shared/constants/api";
import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";

import type {
  ProductCategory,
  ProductDimensions,
  ProductImage,
} from "../../../shared/types/product";

import LoadingOverlay from "../../../shared/components/common/LoadingOverlay";

type ProductVariantData = {
  variantId: string; // required for variant-specific updates
  sku: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  countInStock: number;
  category: ProductCategory;
  color?: string;
  variant?: string;
  variantImages: ProductImage[];
};
type ProductData = {
  name: string;
  description: string;
  // product fields
  images: ProductImage[];
  isListed: boolean;
  dimensions?: ProductDimensions;
  weight?: number;
};
const CATEGORIES: ProductCategory[] = [
  "Learning Tower",
  "Utensils",
  "Accessories",
];

const EditProductPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const showOverlay = loading || uploading;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id, variantId } = useParams();

  const { selectedProduct, productVariants, error } = useAppSelector(
    (state) => state.products,
  );

  const productFileInputRef = useRef<HTMLInputElement | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement | null>(null);

  const [productUploadedFileName, setProductUploadedFileName] = useState("");
  const [variantUploadedFileName, setVariantUploadedFileName] = useState("");

  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    images: [],
    isListed: false,
    dimensions: undefined,
    weight: undefined,
  });

  const [productVariantData, setProductVariantData] =
    useState<ProductVariantData>({
      variantId: "",
      sku: "",
      name: "",
      price: 0,
      discountPrice: undefined,
      countInStock: 0,
      category: "Learning Tower",
      color: undefined,
      variant: undefined,
      variantImages: [],
    });

  // fetch product details
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        await dispatch(fetchProductDetails({ id })).unwrap();
        await dispatch(fetchProductVariants({ productIds: [id] })).unwrap();
      } catch (err) {
        console.error("EditProductPage initial load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [dispatch, id]);

  // map selectedProduct -> ProductData
  useEffect(() => {
    if (selectedProduct) {
      setProductData({
        name: selectedProduct.name ?? "",
        description: selectedProduct.description ?? "",
        images: selectedProduct.images ?? [],
        isListed: selectedProduct.isListed ?? false,
        dimensions: selectedProduct.dimensions,
        weight: selectedProduct.weight,
      });
    }
  }, [selectedProduct]);

  // auto-fetch the product's default variant
  useEffect(() => {
    if (!id || !variantId || !productVariants[id]) return;
    const variantsForSelectedProduct = productVariants[id];
    const selectedVariant = variantsForSelectedProduct.find(
      (v) => v._id === variantId,
    );
    if (selectedVariant) {
      setProductVariantData({
        variantId: selectedVariant._id,
        sku: selectedVariant.sku,
        name: selectedVariant.name,
        price: selectedVariant.price,
        discountPrice: selectedVariant.discountPrice,
        countInStock: selectedVariant.countInStock,
        category: selectedVariant.category,
        color: selectedVariant.color ?? "",
        variant: selectedVariant.variant ?? "",
        variantImages: selectedVariant.images || [],
      });
    }
  }, [productVariants, id, variantId]);

  // variant switcher logic
  const handleSwitchVariant = (e: ChangeEvent<HTMLSelectElement>) => {
    const newVariantId = e.target.value;
    if (newVariantId && id) {
      // Update the URL to point to the new variant
      navigate(`/admin/products/${id}/edit/${newVariantId}`);
    }
  };

  // Generic Product Handler
  const handleProductChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    // Handle Checkbox
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProductData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  // Specific Dimensions Handler
  const handleDimensionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: Number(value),
      },
    }));
  };

  // Generic Variant Handler
  const handleVariantChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProductVariantData((prev) => {
      // special case: discountPrice empty => null
      if (name === "discountPrice") {
        return {
          ...prev,
          discountPrice: value.trim() === "" ? null : Number(value),
        };
      }

      // other numeric fields
      if (name === "price" || name === "countInStock") {
        return { ...prev, [name]: Number(value) };
      }

      // everything else
      return { ...prev, [name]: value };
    });
  };

  // Image Upload (Shared Logic)
  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    target: "product" | "variant",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "product") {
      setProductUploadedFileName(file.name);
    } else {
      setVariantUploadedFileName(file.name);
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImage = { publicId: data.publicId, altText: "" };

      if (target === "product") {
        setProductData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
        }));
      } else {
        setProductVariantData((prev) => ({
          ...prev,
          variantImages: [...prev.variantImages, newImage],
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const handleUpdateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      // console.log("Submitting Product:", productData);
      await dispatch(updateProduct({ id, productData })).unwrap();

      // refresh product details to reflect saved state
      await dispatch(fetchProductDetails({ id })).unwrap();

      toast.success("Product updated successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update product");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateProductVariant = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !variantId) return;
    setLoading(true);

    try {
      const { variantImages, ...rest } = productVariantData;
      // console.log("Submitting product variant:", productVariantData);
      await dispatch(
        updateProductVariant({
          productId: id,
          variantId,
          variantData: {
            ...rest,
            images: variantImages,
            discountPrice: rest.discountPrice ?? null, // keep null if removing
          },
        }),
      ).unwrap();

      // refresh variants so dropdown stock/name etc stays correct
      await dispatch(fetchProductVariants({ productIds: [id] })).unwrap();

      toast.success("Product variant updated successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update product variant");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p>Error: {error}</p>;

  const availableVariants =
    id && productVariants[id] ? productVariants[id] : [];

  return (
    <>
      <LoadingOverlay show={showOverlay} />
      <div className="mb-2">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-md font-semibold text-gray-700 hover:text-blue-600"
        >
          ← Back to Product Management
        </Link>
      </div>
      <div className="max-w-6xl mx-auto p-6 shadow-md rounded-md">
        <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
        {/* GLOBAL PRODUCT DETAILS */}
        <form onSubmit={handleUpdateProduct}>
          {/* Name */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Description */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Description</label>
            <div data-color-mode="light" className="md-big-toolbar">
              <MDEditor
                value={productData.description}
                onChange={(val) =>
                  setProductData((prev) => ({
                    ...prev,
                    description: val ?? "",
                  }))
                }
                height={360}
              />
            </div>
          </div>
          {/* Dimensions */}
          <div className="col-span-2">
            <label className="block font-semibold mb-2">Dimensions (cm)</label>
            <div className="flex gap-4">
              <input
                placeholder="Length"
                type="number"
                name="length"
                value={productData.dimensions?.length ?? ""}
                onChange={handleDimensionChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                placeholder="Width"
                type="number"
                name="width"
                value={productData.dimensions?.width ?? ""}
                onChange={handleDimensionChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                placeholder="Height"
                type="number"
                name="height"
                value={productData.dimensions?.height ?? ""}
                onChange={handleDimensionChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
          {/* Weight */}
          <div>
            <label className="block font-semibold mb-1 mt-6">Weight (g)</label>
            <input
              type="number"
              name="weight"
              value={productData.weight ?? ""}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Is Listed Checkbox */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="isListed"
              id="isListed"
              checked={productData.isListed}
              onChange={handleProductChange}
              className="w-5 h-5 text-green-600 rounded"
            />
            <label htmlFor="isListed" className="ml-2 font-semibold">
              List Product for Sale?
            </label>
          </div>
          {/* Product Images */}
          <div className="col-span-2">
            <label className="block font-semibold mb-2 mt-6">
              Product Images
            </label>
            {uploading && <p>Uploading image...</p>}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => productFileInputRef.current?.click()}
                className="bg-acloblue/80 text-white py-2 px-4 rounded hover:bg-acloblue cursor-pointer"
                disabled={uploading}
              >
                Choose file
              </button>

              <span className="text-sm text-gray-600">
                {productUploadedFileName
                  ? productUploadedFileName
                  : "No file selected"}
              </span>

              <input
                ref={productFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "product")}
                accept="image/*"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {productData.images.map((img, i) => (
                <img
                  key={i}
                  src={cloudinaryImageUrl(img.publicId)}
                  className="w-16 h-16 object-cover rounded border border-blue-300"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors mt-8 mb-8 cursor-pointer"
          >
            Update Product
          </button>
        </form>
      </div>
      <div className="max-w-6xl mt-6 mx-auto p-6 shadow-md rounded-md">
        <h2 className="text-3xl font-bold mb-6">Edit Product Variant</h2>
        {/* PRODUCT VARIANT DETAILS */}
        <form onSubmit={handleUpdateProductVariant}>
          <div className="mt-6 p-4 bg-gray-50 border border-blue-200 rounded-md">
            <label className="block font-bold text-gray-700 mb-2">
              Switch to a different variant:
            </label>
            <select
              value={productVariantData.variantId}
              onChange={handleSwitchVariant}
              className="w-full p-2 border border-blue-300 rounded-md bg-white shadow-sm"
            >
              <option value="" disabled>
                Select a variant to edit
              </option>
              {availableVariants.map((v) => {
                return (
                  <option key={v._id} value={v._id}>
                    {v.name} (Stock: {v.countInStock})
                  </option>
                );
              })}
            </select>
          </div>

          <h3 className="text-xl font-semibold border-b pb-2 mb-4 mt-8 bg-gray-100 p-2 rounded-t">
            Current Variant:{" "}
            <span className="text-blue-600">{productVariantData.sku}</span>
          </h3>
          {/* Original Price */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Original Price</label>
            <input
              type="number"
              name="price"
              value={productVariantData.price}
              onChange={handleVariantChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Discounted Price */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Discounted Price</label>
            <input
              type="number"
              name="discountPrice"
              value={productVariantData.discountPrice ?? ""}
              onChange={handleVariantChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              name="category"
              value={productVariantData.category}
              onChange={handleVariantChange}
              className="w-full border border-gray-300 rounded-md p-2 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* SKU */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 mt-6">SKU</label>
            <input
              type="text"
              name="sku"
              value={productVariantData.sku}
              onChange={handleVariantChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {/* Count in Stock */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Count in Stock</label>
            <input
              type="number"
              name="countInStock"
              value={productVariantData.countInStock}
              onChange={handleVariantChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Color & Variant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">
                Color (Raw Input)
              </label>
              <input
                type="text"
                name="color"
                placeholder="e.g. Blue"
                value={productVariantData.color ?? ""}
                onChange={handleVariantChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Variant Option (Raw Input)
              </label>
              <input
                type="text"
                name="variant"
                placeholder="e.g. Falcon"
                value={productVariantData.variant ?? ""}
                onChange={handleVariantChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          {/* Variant Images */}
          <div className="col-span-2">
            <label className="block font-semibold mb-2">Variant Images</label>
            {uploading && <p>Uploading image...</p>}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => variantFileInputRef.current?.click()}
                className="bg-acloblue/80 text-white py-2 px-4 rounded hover:bg-acloblue cursor-pointer"
                disabled={uploading}
              >
                Choose file
              </button>

              <span className="text-sm text-gray-600">
                {variantUploadedFileName
                  ? variantUploadedFileName
                  : "No file selected"}
              </span>

              <input
                ref={variantFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "variant")}
                accept="image/*"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {productVariantData.variantImages.map((img, i) => (
                <img
                  key={i}
                  src={cloudinaryImageUrl(img.publicId)}
                  className="w-16 h-16 object-cover rounded border border-blue-300"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors mt-8 cursor-pointer"
          >
            Update Product Variant
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProductPage;
