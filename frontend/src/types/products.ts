export type ProductImage = {
	url: string;
	altText?: string;
};

export type Product = {
	_id: string | number;
	name: string;
	price: number;
	images: ProductImage[];
};