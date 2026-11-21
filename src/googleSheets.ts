import fallbackOfferingsData from "./data/offerings.json";
import type { OfferingCategory } from "./schemas";

/*
 * PRICING / GOOGLE SHEETS DISABLED
 * --------------------------------
 * Prices and Google Sheets are deliberately not used by the site.
 * getOfferingsData() always reads src/data/offerings.json.
 *
 * Re-enable in src/googleSheets.ts only after restoring the integration and
 * price fields in this file, src/schemas.ts, public/admin/config.yml,
 * src/components/Catalog/CatalogSection.astro and scripts/deploy-check.mjs.
 * Set GOOGLE_SHEETS_ENABLED and PRICE_DISPLAY_ENABLED separately; neither
 * option is enabled by an environment variable.
 */
export const GOOGLE_SHEETS_ENABLED = false;
export const PRICE_DISPLAY_ENABLED = false;

interface LocalizedText {
  hr: string;
  en: string;
}

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

type OfferingsPage = "commercial" | "residential";

const offeringsPageCategories: Record<OfferingsPage, OfferingCategory[]> = {
  commercial: ["Included", "Optional"],
  residential: ["Included", "Optional"],
};

let offeringsDataPromise: Promise<AstroOfferingsData> | undefined;

function isOfferingsPage(value: unknown): value is OfferingsPage {
  return value === "commercial" || value === "residential";
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
  // Local-only by design. GOOGLE_SHEETS_ENABLED and PRICE_DISPLAY_ENABLED
  // above are hard disabled and must not be changed accidentally.
  return getFallbackOfferingsData();
}

export async function getOfferingsData(): Promise<AstroOfferingsData> {
  offeringsDataPromise ??= loadAstroOfferingsData();
  return offeringsDataPromise;
}
