// Shape of the customer home feed response. Only `promoBanners` (+ `header`,
// which colors the banner container) are consumed by the app right now —
// `search`, `topIcons` and `sections` are typed for forward-compatibility
// but not wired up to any screen yet.

export interface HomeTrendingTerm {
  id: string;
  term: string;
  displayLabel: string | null;
  iconUrl: string | null;
  displayOrder: number;
}

export interface HomeSearchConfig {
  placeholder: string;
  trendingTerms: HomeTrendingTerm[];
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  /** Cutout/transparent-background image shown on the right of the banner. */
  imageUrl: string | null;
  ctaShown: boolean;
  ctaTitle: string;
  ctaRoute: string;
  displayOrder: number;
}

export type HomeHeaderBackgroundType = 'GRADIENT' | 'SOLID';
export type HomeHeaderGradientDirection =
  | 'LEFT_TO_RIGHT'
  | 'RIGHT_TO_LEFT'
  | 'TOP_TO_BOTTOM'
  | 'BOTTOM_TO_TOP'
  | 'DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT'
  | 'DIAGONAL_TOP_RIGHT_TO_BOTTOM_LEFT'
  | 'DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT'
  | 'DIAGONAL_BOTTOM_RIGHT_TO_TOP_LEFT';

export interface HomeHeaderConfig {
  id: string;
  backgroundType: HomeHeaderBackgroundType;
  solidColor: string | null;
  gradientColors: string[] | null;
  gradientDirection: HomeHeaderGradientDirection | null;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeTopIconEntity {
  name: string;
  slug: string;
  iconUrl: string;
}

export interface HomeTopIcon {
  id: string;
  entityType: 'CATEGORY' | string;
  entityId: string;
  displayOrder: number;
  entity: HomeTopIconEntity;
}

export interface HomeSectionServiceEntity {
  name: string;
  slug: string;
  thumbnailUrl: string;
  startingPriceMinor: number;
  strikePriceMinor: number | null;
}

export interface HomeSectionItem {
  id: string;
  entityType: 'SERVICE' | string;
  entityId: string;
  displayOrder: number;
  entity: HomeSectionServiceEntity;
}

export interface HomeSection {
  id: string;
  title: string;
  displayOrder: number;
  items: HomeSectionItem[];
}

export interface HomeFeedResponse {
  search: HomeSearchConfig;
  promoBanners: PromoBanner[];
  header: HomeHeaderConfig;
  topIcons: HomeTopIcon[];
  sections: HomeSection[];
}
