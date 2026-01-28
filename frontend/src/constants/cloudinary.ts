const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const assets = {
  hero: {
    type: "image",
    publicId: "landing_hero_bg_z65ix8",
    alt: "Toddler cooking using ACLO learning tower",
  },
  intro: {
    type: "image",
    publicId: "intro_ukqtou",
    alt: "Two children preparing fruit snacks at the counter with ACLO learning tower.",
  },

  independenceCarousel: [
    {
      publicId: "landing_independence_carousel_01_acfvtx",
      alt: "Toddler shaping dough using ACLO learning tower at the counter.",
      caption: "Help Cook",
    },
    {
      publicId: "landing_independence_carousel_02_kp6n9m",
      alt: "Parent helping a toddler to wash hand at the sink with a learning tower.",
      caption: "Wash Hands",
    },
    {
      publicId: "landing_independence_carousel_03_m9xdow",
      alt: "Child reading a book while sitting on ACLO learning tower.",
      caption: "Read Books",
    },
    {
      publicId: "landing_independence_carousel_04_yopkfe",
      alt: "Toddler reaching up using ACLO learning tower.",
      caption: "Reach Up",
    },
    {
      publicId: "landing_independence_carousel_05_ckc0bu",
      alt: "Toddler drinking from a cup while standing on a learning tower.",
      caption: "Drink Milk",
    },
    {
      publicId: "landing_independence_carousel_06_1_pfvtbg",
      alt: "Toddler brushing teeth at the counter on ACLO learning tower.",
      caption: "Brush Teeth",
    },
  ] as const,

  littleHelpers: {
    type: "image",
    publicId: "landing_built-for-little-helpers_v10sst",
    alt: "Child pouring milk into a cup at the counter beside a snack tray.",
  },

  logos: {
    horizontal: {
      type: "image",
      publicId: "ACLO_LOGO_HORIZONTAL-06_1_mdrbx8",
      alt: "ACLO logo",
    },
    vertical: {
      type: "image",
      publicId: "ACLO_LOGO_VERTICAL-04_1_twkhki",
      alt: "ACLO logo",
    },
  },

  register: {
    type: "image",
    publicId: "Register_jm43au",
    alt: "Child on ACLO learning tower cutting bananas at the counter.",
  },

  login: {
    type: "image",
    publicId: "Login_uji3bg",
    alt: "Child on ACLO learning tower at the counter.",
  },

  reset: {
    type: "image",
    publicId: "Reset_ryslxk",
    alt: "Child on ACLO learning tower and mom cooking together in kitchen",
  },

  forget: {
    type: "image",
    publicId: "Forget_ajawhh",
    alt: "Child and mother cooking together using ACLO learning tower.",
  },

  story: {
    story_1: {
      type: "image",
      publicId: "Story-1_c4rh5s",
    },
    story_2: {
      type: "image",
      publicId: "Story-2_dsqavj",
    },
    story_3: {
      type: "image",
      publicId: "Story-3_fyabcn",
    },
  },

  contact: {
    type: "image",
    publicId: "Contact_xddto7",
    alt: "ACLO family moment in the kitchen",
  },

  learnMore: {
    learnMore_1: {
      type: "image",
      publicId: "learnmore-1_ykwm7r",
    },
    learnMore_2: {
      type: "image",
      publicId: "learnmore-2_ju9rkm",
    },
    learnMore_3: {
      type: "image",
      publicId: "learnmore-3_qdyw2d",
    },
    learnMore_4: {
      type: "image",
      publicId: "learnmore-4_hfxsr9",
    },
    learnMore_5: {
      type: "image",
      publicId: "learnmore-5_rdc7ne",
    },
    learnMore_6: {
      type: "image",
      publicId: "learnmore-6_uji9rj",
    },
    learnMore_7: {
      type: "image",
      publicId: "learnmore-7_e8ascy",
    },
  },
} as const;

export function cloudinaryImageUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}
