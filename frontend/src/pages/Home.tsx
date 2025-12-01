import Hero from "../components/layout/Hero";
import NewArrivals from "../components/products/NewArrivals";
import ProductDetails from "../components/products/ProductDetails";
import ProductGrid, { type Product } from "../components/products/ProductGrid";
import ProductsCollection from "../components/products/ProductsCollection";

const placeholderProducts: Product[] = [
	{
		_id: 5,
		name: "Product 1",
		price: 21000,
		images: [{ url: "https://picsum.photos/500/500?random=12" }],
	},
	{
		_id: 6,
		name: "Product 2",
		price: 22000,
		images: [{ url: "https://picsum.photos/500/500?random=13" }],
	},
	{
		_id: 7,
		name: "Product 3",
		price: 24000,
		images: [{ url: "https://picsum.photos/500/500?random=14" }],
	},
	{
		_id: 8,
		name: "Product 4",
		price: 29000,
		images: [{ url: "https://picsum.photos/500/500?random=15" }],
	},
];

const Home = () => {
	return (
		<div>
			<Hero />
			<ProductsCollection />
			<NewArrivals />
			{/* Best Seller */}
			<h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
			<ProductDetails />

			<div className="container mx-auto">
				<h2 className="text-3xl text-center font-bold mb-4">Quill</h2>
				<ProductGrid products={placeholderProducts} />
			</div>
		</div>
	);
};

export default Home;
