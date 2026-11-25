import { SITE, BUSINESS, DEVELOPER } from "@data/client";

export function getLocalBusinessSchema(origin) {
  const sameAs = [];
  if (BUSINESS.socials?.facebook) sameAs.push(BUSINESS.socials.facebook);
  if (BUSINESS.socials?.instagram) sameAs.push(BUSINESS.socials.instagram);

  const businessId = `${SITE.url}/#business`;
  const websiteId = `${SITE.url}/#website`;
  const developerId = `${DEVELOPER.url}#person`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE.title,
        url: SITE.url,
        description: SITE.description,
        inLanguage: ["hr-HR", "en-US"],
        creator: {
          "@id": developerId,
        },
        publisher: {
          "@id": businessId,
        },
      },
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": businessId,
        name: BUSINESS.name,
        alternateName: ["Eko Ciscenje", "Eko Čišćenje"],
        description: SITE.description,
        url: SITE.url,
        logo: origin + BUSINESS.logo,
        image: [`${origin}/assets/social.jpg`],
        telephone: BUSINESS.phoneForTel,
        address: {
          "@type": "PostalAddress",
          streetAddress: [BUSINESS.address.lineOne, BUSINESS.address.lineTwo]
            .filter(Boolean)
            .join(", "),
          addressLocality: BUSINESS.address.city,
          addressRegion: BUSINESS.address.state,
          postalCode: BUSINESS.address.zip,
          addressCountry: "HR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 45.780495,
          longitude: 15.9879,
        },
        hasMap: BUSINESS.address.mapLink,
        serviceType: [
          "Steam cleaning",
          "Eco cleaning",
          "Carpet cleaning",
          "Upholstery cleaning",
        ],
        areaServed: [
          {
            "@type": "City",
            name: "Zagreb",
          },
          {
            "@type": "City",
            name: "Samobor",
          },
          {
            "@type": "City",
            name: "Velika Gorica",
          },
          {
            "@type": "City",
            name: "Zapresic",
            alternateName: "Zaprešić",
          },
          {
            "@type": "City",
            name: "Sveta Nedelja",
          },
          {
            "@type": "City",
            name: "Dugo Selo",
          },
          {
            "@type": "City",
            name: "Jastrebarsko",
          },
          {
            "@type": "City",
            name: "Karlovac",
          },
          {
            "@type": "City",
            name: "Krapina",
          },
          {
            "@type": "City",
            name: "Sisak",
          },
          {
            "@type": "AdministrativeArea",
            name: "Zagreb and surrounding area",
          },
          {
            "@type": "Place",
            name: "Sredisce",
            alternateName: "Središće",
            containedInPlace: {
              "@type": "Place",
              name: "Novi Zagreb",
            },
          },
          {
            "@type": "Place",
            name: "Bundek",
          },
        ],
        knowsAbout: [
          "steam cleaning in Zagreb and surrounding area",
          "eco-friendly cleaning",
          "carpet cleaning",
          "upholstery cleaning",
          "home cleaning service",
          "office cleaning service",
          "deep cleaning without chemicals",
        ],
        keywords:
          "Eko Čišćenje, Eko Ciscenje, čišćenje parom Zagreb, čišćenje parom Samobor, čišćenje parom Velika Gorica, čišćenje parom Zaprešić, čišćenje parom Sveta Nedelja, čišćenje parom Dugo Selo, čišćenje parom Jastrebarsko, čišćenje parom Karlovac, čišćenje parom Krapina, čišćenje parom Sisak, tepih čišćenje, uredsko čišćenje, ekološko čišćenje",
        sameAs,
        inLanguage: SITE.locale,
      },
      {
        "@type": "Person",
        "@id": developerId,
        name: DEVELOPER.name,
        url: DEVELOPER.url,
      },
      {
        "@type": "Place",
        "@id": `${SITE.url}/#nearby-bundek`,
        name: "Bundek Lake and Park",
        alternateName: "Jezero i park Bundek",
        description:
          "Bundek is a Novi Zagreb lake and park area near Eko Čišćenje, with walking paths, green areas and children's playgrounds.",
        containedInPlace: {
          "@type": "City",
          name: "Zagreb",
        },
      },
    ],
  };

  if (BUSINESS.email) {
    schema["@graph"][1].email = BUSINESS.email;
  }

  return schema;
}
