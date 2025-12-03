import { AiFillTikTok } from "react-icons/ai";
import { FaSquareFacebook } from "react-icons/fa6";
import { FiPhoneCall } from "react-icons/fi";
import { IoLogoInstagram } from "react-icons/io";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../constants/categories";

const Footer = () => {
	return (
		<footer className="border-t border-gray-200 py-12">
			<div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0">
				<div>
					<h3 className="text-lg text-gray-800 mb-4">Newsletter</h3>
					<p className="text-gray-500 mb-4">
						Be the first to hear about new offers and exclusive events
					</p>
					<p className="font-medium text-sm text-gray-600 mb-6">
						Sign up and get 10% off your first order.
					</p>
					{/* Newsletter form */}
					<form action="" className="flex">
						<input
							type="email"
							placeholder="Enter your email"
							className="p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
							required
						/>
						<button
							type="submit"
							className="bg-primary text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all"
						>
							Subscribe
						</button>
					</form>
				</div>
				{/* Shop links */}
				<div>
					<h3 className="text-lg text-gray-800 mb-4">Shop</h3>
					<ul className="space-y-2 text-gray-600">
						{CATEGORIES.map((category) => (
							<li key={category}>
								<Link
									// to={`/collections/${category.toLowerCase().replace(/\s+/g, "-")}`}
									to="#"
									className="text-gray-500 transition-colors"
								>
									{category}
								</Link>
							</li>
						))}
					</ul>
				</div>
				{/* Support links */}
				<div>
					<h3 className="text-lg text-gray-800 mb-4">Support</h3>
					<ul className="space-y-2 text-gray-600">
						<li>
							<Link to="#" className="text-gray-500 transition-colors">
								Contact Us
							</Link>
						</li>
						<li>
							<Link to="#" className="text-gray-500 transition-colors">
								About Us
							</Link>
						</li>
						<li>
							<Link to="#" className="text-gray-500 transition-colors">
								FAQs
							</Link>
						</li>
						<li>
							<Link to="#" className="text-gray-500 transition-colors">
								Features
							</Link>
						</li>
					</ul>
				</div>
				{/* Follow us section */}
				<div>
					<h3 className="text-lg text-gray-800 mb-4">Follow Us</h3>
					<div className="flex items-center space-x-4 mb-6">
						<a
							href="http://www.instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gray-500"
						>
							<IoLogoInstagram className="h-6 w-6" />
						</a>
						<a
							href="http://www.facebook.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gray-500"
						>
							<FaSquareFacebook className="h-5 w-5" />
						</a>
						<a
							href="http://www.tiktok.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gray-500"
						>
							<AiFillTikTok className="h-6 w-6" />
						</a>
					</div>
					<p className="mb-3">Call Us</p>
					<p>
						<FiPhoneCall className="inline-block mr-2 " /> 0123-456-789
					</p>
				</div>
			</div>
			{/* Footer Bottom */}
			<div className="container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6">
				<p className="text-gray-500 text-sm tracking-tighter text-center">
					© 2025, SomeName. All Rights Reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
