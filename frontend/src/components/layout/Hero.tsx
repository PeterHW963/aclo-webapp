import { Link } from "react-router-dom";
import heroImg from "../../assets/hero-img1.jpg";

const Hero = () => {
	return (
		<section className="relative">
			<img
				src={heroImg}
				alt="Hero Image"
				className="w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover"
			/>
			<div className="absolute inset-0 bg-white/20 flex items-center justify-center">
				<div className="text-center text-accent1 p-6">
					<h1 className="text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
						Premium <br /> Learning Tower
					</h1>
					<p className="text-lg tracking-tighter md:text-lg mb-8">
						One Tower, Endless Everyday Adventures
					</p>
					<Link
						to="#"
						className="bg-secondary text-white px-6 py-3 rounded-sm text-lg"
					>
						Shop Now
					</Link>
				</div>
			</div>
		</section>
	);
};

export default Hero;
