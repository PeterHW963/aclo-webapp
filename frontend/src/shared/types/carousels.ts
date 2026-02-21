import type { EmblaOptionsType } from "embla-carousel";

export type Slide = {
  publicId: string;
  alt: string;
  caption: string;
};

export type EmblaCarouselProps = {
  slides: Slide[];
  options?: EmblaOptionsType;
};

export type ReviewSlide = {
  publicId: string;
  alt: string;
  productLabel: string;
  stars: number;
  quote: string;
  author: string;
  ctaTo: string;
  ctaText?: string;
};
