import { Link } from "react-router-dom";
import type { Product } from "../../types/products";

type ProductGridProps = {
	products: Product[];
};

const ProductGrid = ({ products }: ProductGridProps) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 space-y-4">
			{products.map((product, index) => (
				<Link key={index} to={`/product/${product._id}`} className="block">
					<div className="bg-white p-4 rounded-lg">
						<div className="w-full h-96 mb-3">
							<img
								src={product.images[0].url}
								alt={product.images[0].altText || product.name}
								className="w-full h-full object-cover rounded-lg"
							/>
						</div>
					</div>
					<h3 className="text-sm px-4 mb-2">{product.name}</h3>
					<p className="text-gray-500 px-4 font-medium text-sm tracking-tighter">
						$ {product.price}
					</p>
				</Link>
			))}
		</div>
	);
};

export default ProductGrid;
