import { useState, type ChangeEvent, type FormEvent } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";

const Searchbar = () => {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const handleSearchToggle = () => {
		setIsOpen(!isOpen);
	};

	const handleSearch = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Search Term: ", searchTerm);
		setIsOpen(false);
	};

	return (
		<div
			className={`flex items-center justify-center w-full transition-all duration-300 ${
				isOpen ? "absolute top-12 left-0 w-full bg-white h-16" : "w-auto"
			}`}
		>
			{isOpen ? (
				<form
					onSubmit={handleSearch}
					className="relative flex items-center justify-center w-full"
				>
					<div className="relative w-1/2">
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setSearchTerm(e.target.value)
							}
							className="bg-gray-200 px-4 py-2 pr-12 ml-2 w-full focus:outline-none rounded-lg"
						/>
						<button
							type="submit"
							className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:text-gray-600 hover:cursor-pointer"
						>
							<HiMagnifyingGlass className="h-6 w-6" />
						</button>
					</div>
					<button
						type="button"
						onClick={handleSearchToggle}
						className="ml-4 hover:text-gray-600 hover:cursor-pointer"
					>
						<HiMiniXMark className="h-6 w-6" />
					</button>
				</form>
			) : (
				<button onClick={handleSearchToggle}>
					<HiMagnifyingGlass className="h-6 w-6 hover:text-gray-600 hover:cursor-pointer" />
				</button>
			)}
		</div>
	);
};

export default Searchbar;
