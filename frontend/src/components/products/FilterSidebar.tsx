import { useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { COLOR_MAP, COLOR_OPTIONS } from "../../constants/colors";
import { CATEGORIES } from "../../constants/categories";
// WORK IN PROGRESS
type FilterState = {
	category: string;
	color: string;
	material: string[];
	minPrice: number;
	maxPrice: number;
};

const FilterSidebar = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [filter, setFilters] = useState<FilterState>({
		category: "",
		color: "",
		material: [],
		minPrice: 0,
		maxPrice: 1000000,
	});
	// filter constants can be stored in DB
	// const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
	const materials = ["Birch plywood", "Oak plywood"];

	const params = Object.fromEntries([...searchParams]);
	// const filter: FilterState = {
	// 	category: params.category || "",
	// 	color: params.color || "",
	// 	material: params.material ? params.material.split(",") : [],
	// 	minPrice: params.minPrice ? Number(params.minPrice) : 0,
	// 	maxPrice: params.maxPrice ? Number(params.maxPrice) : 1000000,
	// };
	const priceRange: [number, number] = [filter.minPrice, filter.maxPrice];
	useEffect(() => {
		const params = Object.fromEntries([...searchParams]);
		// you get this {category: "Learning Tower", maxPrice: 10000} and you access like this params.category
		const maxPrice = params.maxPrice ? Number(params.maxPrice) : 1000000;
		const minPrice = params.minPrice ? Number(params.minPrice) : 0;
		setFilters({
			category: params.category || "",
			color: params.color || "",
			material: params.material ? params.material.split(",") : [],
			minPrice,
			maxPrice,
		});
		setPriceRange([minPrice, maxPrice]);
	}, [searchParams]);
	const handleFilterChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const params = new URLSearchParams(searchParams);
		const { name, value } = e.target;

		if ("checked" in e.target && e.target.type === "checkbox") {
			const materials = params.get(name)?.split(",") ?? [];

			if (e.target.checked) {
				materials.push(value);
			} else {
				const updated = materials.filter((m) => m !== value);
				if (updated.length === 0) params.delete(name);
				else params.set(name, updated.join(","));
			}
		} else {
			// Handles <select>, <input type="text">, etc.
			if (value === "" || value === "all") params.delete(name);
			else params.set(name, value);
		}

		setSearchParams(params);
	};

	const handleFilterClick = (name: string, value: string) => {
		const params = new URLSearchParams(searchParams);

		if (params.get(name) === value) {
			params.delete(name);
		} else {
			params.set(name, value);
		}

		setSearchParams(params);
	};

	return (
		<div className="p-4">
			<h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
			{/* Category filter */}
			<div className="mb-6">
				<label className="block text-gray-600 font-medium mb-2">Category</label>
				{CATEGORIES.map((category) => (
					<div key={category} className="flex items-center mb-1">
						<input
							type="radio"
							name="category"
							value={category}
							onChange={handleFilterChange}
							className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 cursor-pointer"
						/>
						<span className="text-gray-700">{category}</span>
					</div>
				))}
			</div>
			{/* Colors filter */}
			<div className="mb-6">
				<label className="block text-gray-600 font-medium mb-2">Color</label>
				<div className="flex flex-wrap gap-2">
					{COLOR_OPTIONS.map((color) => (
						<button
							key={color}
							name="color"
							value={color}
							onClick={() => handleFilterClick("color", color)}
							className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer transition hover:scale-105"
							style={{ backgroundColor: COLOR_MAP[color] }}
						/>
					))}
				</div>
			</div>
			{/* Materials filter */}
			<div className="mb-6">
				<label className="block text-gray-600 font medium mb-2">Material</label>
				{materials.map((material) => (
					<div key={material} className="flex items-center mb-1">
						<input
							type="checkbox"
							name="material"
							checked={filter.material.includes(material)}
							value={material}
							onChange={handleFilterChange}
							className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
						/>
						<span className="text-gray-700">{material}</span>
					</div>
				))}
			</div>

			{/* Price Range filter */}
			<div className="mb-8">
				<label className="block text-gray-600 font-medium mb-2">
					Price Range
				</label>
				<input
					type="range"
					name="priceRange"
					min={0}
					max={1000000}
					className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
				/>
				<div className="flex justify-between text-gray-600 mt-2">
					<span>0</span>
					<span>{priceRange[1]}</span>
				</div>
			</div>
		</div>
	);
};

export default FilterSidebar;
