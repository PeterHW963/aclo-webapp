import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";

import type { EmblaCarouselProps } from "../../../../shared/types/carousels";

import { NextButton, PrevButton } from "./EmblaCarouselArrowButtons";
import { usePrevNextButtons } from "./usePrevNextButtons";
import "./embla.css";

import { cloudinaryImageUrl } from "../../../../shared/constants/cloudinary";

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [ClassNames()]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className="embla embla--with-arrows">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide) => {
            const url = cloudinaryImageUrl(slide.publicId);
            return (
              <div className="embla__slide" key={slide.publicId}>
                <div className="embla__slide__inner embla__media">
                  <img
                    className="embla__slide__img"
                    src={url}
                    alt={slide.alt}
                  />

                  {slide.caption && (
                    <div className="embla__caption">
                      <span className="embla__captionText">
                        {slide.caption}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PrevButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
        className="embla__arrow embla__arrow--prev"
      />
      <NextButton
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        className="embla__arrow embla__arrow--next"
      />
    </div>
  );
};

export default EmblaCarousel;
