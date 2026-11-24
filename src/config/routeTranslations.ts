import type { Locale } from "./siteSettings";

export const routeTranslations: Record<Locale, Record<string, string>> = {
  hr: {
    "about": "o-nama",
    "projects": "usluge",
    "residential": "ciscenje-stanova",
    "commercial": "ciscenje-uredskih-prostora",
    "pharmacy": "ciscenje-ljekarni",
    "boat": "ciscenje-brodova",
    "reviews": "recenzije",
  },
  en: {
    "about": "about",
    "projects": "offerings",
    "residential": "residential-cleaning",
    "commercial": "commercial-cleaning",
    "pharmacy": "pharmacy-cleaning",
    "boat": "boat-cleaning",
    "reviews": "reviews",
  },
};

export const localizedCollections = {} as const;
