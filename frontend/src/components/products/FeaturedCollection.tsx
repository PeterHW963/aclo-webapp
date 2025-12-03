import { Link } from "react-router-dom";
import featuredImg from "../../assets/featured-collection1.jpg";

const FeaturedCollection = () => {
	return (
		<section className="py-16 px-4 lg:px-0">
			<div className="container mx-auto flex flex-col-reverse lg:flex-row items-center bg-secondary rounded-3xl">
				{/* Left content */}
				<div className="lg:w-1/2 p-8 text-center lg:text-left">
					<h2 className="text-lg font-semibold text-gray-700 mb-2">
						Montessori at Home
					</h2>
					<h2 className="text-4xl lg:text-5xl font-bold mb-6">
						Every corner of our home can be a classroom.
					</h2>
					<p className="text-lg text-gray-600 mb-6">
						With the right tools and freedom, children learn independence,
						confidence, and responsibility through daily life activities.
					</p>
					<Link
						to="/collections/all"
						className="bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800"
					>
						Shop Now
					</Link>
				</div>
				{/* Right content */}
				<div className="lg:w-1/2">
					<img
						src={featuredImg}
						alt="Feature Collection"
						className="w-full h-full object-cover lg:rounded-tr-3xl lg:rounded-br-3xl"
					/>
				</div>
			</div>
		</section>
	);
};

export default FeaturedCollection;
