import fallbackOfferingsData from "./data/offerings.json";
import type { OfferingCategory } from "./schemas";
import type { Locale } from "./config/siteSettings";
import { routeTranslations } from "./config/routeTranslations";

/*
 * LOCAL OFFERINGS / PRICING DISABLED
 * --------------------------------
 * The active catalog is maintained in src/data/offerings.json.
 * Google Sheets is not used to load or refresh catalog data.
 *
 * A future Sheets integration would require a separate implementation and
 * review. Price fields are likewise not currently supported.
 */
export const PRICE_DISPLAY_ENABLED = false;

interface LocalizedText {
  hr: string;
  en: string;
}

export type OfferingsPage = "commercial" | "residential" | "boat" | "pharmacy";
export interface AstroOfferingsCategory {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface AstroOfferingItem {
  id: string;
  categoryId: string;
  page?: OfferingsPage[];
  name: LocalizedText;
  description: LocalizedText;
  badges: {
    hr: string[];
    en: string[];
  };
  available: boolean;
  featured?: boolean;
}

export interface AstroOfferingsData {
  source: "sheet" | "fallback";
  updatedAt: string;
  categories: AstroOfferingsCategory[];
  items: AstroOfferingItem[];
}

const offeringsPageCategories: Record<OfferingsPage, OfferingCategory[]> = {
  commercial: ["Included", "Optional"],
  residential: ["Included", "Optional"],
  boat: ["Included", "Optional"],
  pharmacy: ["Included", "Optional"],
};

let offeringsDataPromise: Promise<AstroOfferingsData> | undefined;

function isOfferingsPage(value: unknown): value is OfferingsPage {
  return (
    value === "commercial" ||
    value === "residential" ||
    value === "boat" ||
    value === "pharmacy"
  );
}

function isOfferingsPageArray(value: unknown): value is OfferingsPage[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && isOfferingsPage(item))
  );
}

export function getOfferingsPageCategoryIds(
  offeringsData: AstroOfferingsData,
  page: OfferingsPage,
): string[] {
  const categoryIds = offeringsPageCategories[page];

  if (!categoryIds) {
    console.warn(`Unknown offerings page requested: ${page}`);
    return [];
  }

  return offeringsData.categories
    .filter((category) => categoryIds.includes(category.id as OfferingCategory))
    .map((category) => category.id);
}

export function getFallbackOfferingsData(): AstroOfferingsData {
  return {
    source: "fallback",
    updatedAt: fallbackOfferingsData.updatedAt,
    categories: fallbackOfferingsData.categories,
    items: fallbackOfferingsData.items.map((item) => {
      const fallbackSource = item as Partial<AstroOfferingItem>;
      return {
        id: fallbackSource.id ?? "",
        categoryId: fallbackSource.categoryId ?? "",
        name: fallbackSource.name ?? { hr: "", en: "" },
        description: fallbackSource.description ?? { hr: "", en: "" },
        badges: fallbackSource.badges ?? { hr: [], en: [] },
        available: fallbackSource.available ?? true,
        ...(isOfferingsPage(fallbackSource.page) ||
        isOfferingsPageArray(fallbackSource.page)
          ? { page: fallbackSource.page }
          : {}),
        ...(typeof fallbackSource.featured === "boolean"
          ? { featured: fallbackSource.featured }
          : {}),
      };
    }),
  };
}

async function loadAstroOfferingsData(): Promise<AstroOfferingsData> {
  return getFallbackOfferingsData();
}

export async function getOfferingsData(): Promise<AstroOfferingsData> {
  offeringsDataPromise ??= loadAstroOfferingsData();
  return offeringsDataPromise;
}

export async function getCatalogPagePaths(locale: Locale) {
  const offeringsData = await getOfferingsData();
  const pages = [...new Set(offeringsData.items.flatMap((item) => item.page ?? []))];

  return pages.map((page) => {
    const slug = routeTranslations[locale][page];
    if (!slug) {
      throw new Error(`Missing ${locale} route translation for ${page}`);
    }

    return {
      params: { slug },
      props: { locale, page },
    };
  });
}