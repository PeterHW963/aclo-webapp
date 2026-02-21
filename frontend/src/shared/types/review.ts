export type Review = {
	_id: string;
	publicId: string;
	alt: string;
	productLabel: string;
	stars: number;
	quote: string;
	author: string;
	ctaTo: string;
	ctaText: string;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
};
