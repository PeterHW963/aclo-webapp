import learningTowerImg1 from "../../assets/learning-tower1.jpg";
import stoolImg1 from "../../assets/stool1.jpg";
import { Link } from "react-router-dom";

const ProductsCollection = () => {
	return (
		<section className="py-16 px-4 lg:px-0">
			<div className="container mx-auto flex flex-col md:flex-row gap-8">
				{/* Learning Tower */}
				<div className="relative flex-1">
					<img
						src={learningTowerImg1}
						alt="Learning Tower Collection"
						className="w-full h-[700px] object-cover"
					/>
					<div className="absolute bottom-8 left-8 bg-white/90 p-4">
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							Learning Tower Collection
						</h2>
						<Link
							to="/collections/all?category=LearningTower"
							className="text-gray-900 underline"
						>
							Shop Now
						</Link>
					</div>
				</div>
				{/* Stool */}
				<div className="relative flex-1">
					<img
						src={stoolImg1}
						alt="Stool Collection"
						className="w-full h-[700px] object-cover"
					/>
					<div className="absolute bottom-8 left-8 bg-white/90 p-4">
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							Stool Collection
						</h2>
						<Link
							to="/collections/all?category=Stool"
							className="text-gray-900 underline"
						>
							Shop Now
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ProductsCollection;
