import { useEffect, useRef, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import { FaFilter } from "react-icons/fa6";
import FilterSidebar from "../components/products/FilterSidebar";
import SortOptions from "../components/products/SortOptions";
import type { Product } from "../types/products";

const CollectionPage = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const sidebarRef = useRef<HTMLDivElement | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const handleClickOutside = (e: MouseEvent) => {
		// close sidebar if clicked outside
		if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
			setIsSidebarOpen(false);
		}
	};

	useEffect(() => {
		// add event listener for clicks
		document.addEventListener("mousedown", handleClickOutside);
		// clean event listener on unmount
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setTimeout(() => {
			const fetchedProducts: Product[] = [
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
				{
					_id: 9,
					name: "Product 5",
					price: 49000,
					images: [{ url: "https://picsum.photos/500/500?random=16" }],
				},
				{
					_id: 10,
					name: "Product 6",
					price: 229000,
					images: [{ url: "https://picsum.photos/500/500?random=17" }],
				},
				{
					_id: 11,
					name: "Product 7",
					price: 291000,
					images: [{ url: "https://picsum.photos/500/500?random=18" }],
				},
				{
					_id: 12,
					name: "Product 8",
					price: 329000,
					images: [{ url: "https://picsum.photos/500/500?random=19" }],
				},
			];
			setProducts(fetchedProducts);
		}, 1000);
	}, []);
	return (
		<div className="flex flex-col lg:flex-row">
			{/* Mobile filter button */}
			<button
				onClick={toggleSidebar}
				className="lg:hidden border border-gray-200 p-2 flex justify-center items-center"
			>
				<FaFilter className="mr-2" /> Filters
			</button>
			{/* Filter sidebar */}
			<div
				ref={sidebarRef}
				className={`${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 
                lg:static lg:translate-x-0`}
			>
				<FilterSidebar />
			</div>
			<div className="grow p-4">
				<h2 className="text-2xl uppercase mb-4">All Collection</h2>
				{/* Sort options */}
				<SortOptions />
				{/* Product Grid */}
				<ProductGrid products={products} />
			</div>
		</div>
	);
};

export default CollectionPage;
