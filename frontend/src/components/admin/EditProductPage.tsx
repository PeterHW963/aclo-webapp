import { useState, type ChangeEvent, type FormEvent } from "react";

type ProductData = {
	name: string;
	description: string;
	price: number;
	countInStock: number;
	sku: string;
	category: string;
	colors: string[];
	materials: string[];
	images: {
		altText: string;
		url: string;
	}[];
};

const EditProductPage = () => {
	// const selectedProduct = {
	// 	name: "Stork Learning Tower",
	// 	price: 56000,
	// 	originalPrice: 69000,
	// 	description: "The Ultra-Slim & Foldable Learning Tower",
	// 	material: "Birch plywood",
	// 	stabiliser: ["Stabiliser", "No stabiliser"],
	// 	colors: ["Natural", "Cerulean", "Silver", "Snow"],
	// 	images: [
	// 		{ url: storkNatural, altText: "Stork Learning Tower - Natural" },
	// 		{ url: storkCerulean, altText: "Stork Learning Tower - Cerulean" },
	// 		{ url: storkSilver, altText: "Stork Learning Tower - Silver" },
	// 		{ url: storkWhite, altText: "Stork Learning Tower - White" },
	// 	],
	// };
	const [productData, setProductData] = useState<ProductData>({
		name: "",
		description: "",
		price: 0,
		countInStock: 0,
		sku: "",
		category: "",
		colors: [],
		materials: [],
		images: [
			{
				altText: "Product 1",
				url: "https://picsum.photos/150?random=1",
			},
			{
				altText: "",
				url: "https://picsum.photos/150?random=2",
			},
		],
	});
	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setProductData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};
	const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		// because we are dealing with files, we need async
		const file = e.target.files?.[0];
		console.log(file);
	};
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(productData);
	};
	return (
		<div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
			<h2 className="text-3xl font-bold mb-6">Edit Product</h2>
			<form onSubmit={handleSubmit}>
				{/* Name */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">Product Name</label>
					<input
						type="text"
						name="name"
						value={productData.name}
						onChange={handleChange}
						className="w-full border border-gray-300 rounded-md p-2"
						required
					/>
				</div>
				{/* Description */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">Description</label>
					<textarea
						name="description"
						value={productData.description}
						onChange={handleChange}
						className="w-full border border-gray-300 rounded-md p-2"
						rows={4}
						required
					></textarea>
				</div>

				{/* Price */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">Price</label>
					<input
						type="number"
						name="price"
						value={productData.price}
						onChange={handleChange}
						className="w-full border border-gray-300 rounded-md p-2"
					/>
				</div>

				{/* Count in Stock */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">Count in Stock</label>
					<input
						type="number"
						name="countInStock"
						value={productData.countInStock}
						onChange={handleChange}
						className="w-full border border-gray-300 rounded-md p-2"
					/>
				</div>

				{/* SKU */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">SKU</label>
					<input
						type="text"
						name="sku"
						value={productData.sku}
						onChange={handleChange}
						className="w-full border border-gray-300 rounded-md p-2"
					/>
				</div>

				{/* Colors */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">
						Colors (comma-separated)
					</label>
					<input
						type="text"
						name="colors"
						value={productData.colors.join(", ")}
						onChange={(e) => {
							setProductData({
								...productData,
								colors: e.target.value.split(",").map((color) => color.trim()),
							});
						}}
						className="w-full border border-gray-300 rounded-md p-2"
					/>
				</div>
				{/* Materials */}
				<div className="mb-6">
					<label className="block font-semibold mb-2">
						Materials (comma-separated)
					</label>
					<input
						type="text"
						name="materials"
						value={productData.materials.join(", ")}
						onChange={(e) => {
							setProductData({
								...productData,
								materials: e.target.value
									.split(",")
									.map((material) => material.trim()),
							});
						}}
						className="w-full border border-gray-300 rounded-md p-2"
					/>
				</div>
				{/* Image upload */}
				<div className="mb-8">
					<label className="block font-semibold mb-2">Upload Image</label>
					<input
						type="file"
						onChange={handleImageUpload}
						className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
					/>
					<div className="flex gap-4 mt-4">
						{productData.images.map((image, index) => (
							<div key={index}>
								<img
									src={image.url}
									alt={image.altText || "Product Image"}
									className="w-20 h-20 object-cover rounded-md shadow-md"
								/>
							</div>
						))}
					</div>
				</div>
				<button
					type="submit"
					className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
				>
					Update Product
				</button>
			</form>
		</div>
	);
};

export default EditProductPage;
