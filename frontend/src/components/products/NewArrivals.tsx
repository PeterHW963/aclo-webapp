import kidsToysImg from "../../assets/toys1.jpg";
import yellowLearningTowerImg from "../../assets/lt-yellow1.jpg";
import foldableStoolImg from "../../assets/stool-folded1.jpg";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";

const NewArrivals = () => {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [startX, setStartX] = useState<number>(0);
	const [scrollLeft, setScrollLeft] = useState<number>(0);
	const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
	const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
	const newArrivals = [
		{
			_id: "1",
			name: "Kids' Toys",
			price: 7000,
			images: [
				{
					url: kidsToysImg,
					altText: "Kids' Toys",
				},
			],
		},
		{
			_id: "2",
			name: "Random Object",
			price: 20000,
			images: [
				{
					url: "https://picsum.photos/500/700?random=1",
					altText: "Random Object",
				},
			],
		},
		{
			_id: "3",
			name: "Blue Learning Tower",
			price: 50000,
			images: [
				{
					url: "/lt-blue2.jpg",
					altText: "Blue Learning Tower",
				},
			],
		},
		{
			_id: "4",
			name: "Yellow Learning Tower",
			price: 50000,
			images: [
				{
					url: yellowLearningTowerImg,
					altText: "Yellow Learning Tower",
				},
			],
		},
		{
			_id: "5",
			name: "Foldable Stool",
			price: 30000,
			images: [
				{
					url: foldableStoolImg,
					altText: "Foldable Stool",
				},
			],
		},
	];

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		const container = scrollRef.current;
		if (!container) return;

		setIsDragging(true);
		setStartX(e.pageX - container.offsetLeft);
		setScrollLeft(container.scrollLeft);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging) return;

		const container = scrollRef.current;
		if (!container) return;

		const x = e.pageX - container.offsetLeft;
		const walk = x - startX;
		container.scrollLeft = scrollLeft - walk;
	};

	const handleMouseUpOrLeave = () => {
		setIsDragging(false);
	};

	const scroll = (direction: "left" | "right") => {
		const container = scrollRef.current;
		if (!container) return;

		const scrollAmount = direction === "left" ? -300 : 300;
		container.scrollBy({ left: scrollAmount, behavior: "smooth" });
	};

	const updateScrollButtons = () => {
		const container = scrollRef.current;
		if (!container) return;
		const leftScroll = container.scrollLeft;
		const rightScrollable =
			container.scrollWidth > leftScroll + container.clientWidth;
		setCanScrollLeft(leftScroll > 0);
		setCanScrollRight(rightScrollable);
	};

	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		container.addEventListener("scroll", updateScrollButtons);
		updateScrollButtons();

		return () => {
			container.removeEventListener("scroll", updateScrollButtons);
		};
	}, []);
	return (
		<section className="py-16 px-4 lg:px-0">
			<div className="container mx-auto text-center mb-10 relative">
				<h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
				<p className="text-lg text-gray-600 mb-8">
					Designed for your little one's development, styled to suit your space.
				</p>
				{/* Scroll buttons */}
				<div className="absolute right-0 bottom-[-30px] flex space-x-2">
					<button
						onClick={() => scroll("left")}
						disabled={!canScrollLeft}
						className={`p-2 rounded border ${
							canScrollLeft
								? "bg-white text-black"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						<FiChevronLeft className="text-2xl" />
					</button>
					<button
						onClick={() => scroll("right")}
						disabled={!canScrollRight}
						className={`p-2 rounded border ${
							canScrollRight
								? "bg-white text-black"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						<FiChevronRight className="text-2xl" />
					</button>
				</div>
			</div>

			{/* Scrollable content */}
			<div
				ref={scrollRef}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUpOrLeave}
				onMouseLeave={handleMouseUpOrLeave}
				className={`container mx-auto overflow-x-scroll flex space-x-6 relative ${
					isDragging ? "cursor-grabbing" : "cursor-grab"
				}`}
			>
				{newArrivals.map((product) => (
					<div
						key={product._id}
						className="min-w-full sm:min-w-[50%] lg:min-w-[30%] relative"
					>
						<img
							src={product.images[0]?.url}
							alt={product.images[0]?.altText || product.name}
							className="w-full h-[500px] object-cover rounded-lg"
							draggable="false"
						/>
						<div className="absolute bottom-0 left-0 right-0 backdrop-blur-md text-black p-4 rounded-b-lg">
							<Link to={`/product/${product._id}`} className="block">
								<h4 className="font-medium">{product.name}</h4>
								<p className="mt-1">IDR {product.price.toLocaleString()}</p>
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default NewArrivals;
