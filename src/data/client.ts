export const SITE = {
  title: "Eko Čišćenje",
  tagline: "Profesionalno čišćenje parom u Zagrebu i okolici",
  description:
    "Eko Čišćenje nudi profesionalno parno čišćenje u Zagrebu i okolnim gradovima za domove, urede, tepihe i tapecirani namještaj, s ekološkim pristupom u potpunosti bez kemikalija.",
  url: "https://eko-ciscenje.com",
  author: "Eko Čišćenje",
  locale: "hr-HR",
};

type BusinessSocials = {
  facebook?: string;
  instagram?: string;
};

const socials: BusinessSocials = {
  facebook: "https://www.facebook.com/profile.php?id=61596459915846#",
  // instagram: "https://www.instagram.com/",
};

export const BUSINESS = {
  name: "Eko Čišćenje",
  phoneForTel: "+385914478191",
  phoneFormatted: " +385 91 447 8191",
  logo: "/favicon.svg",
  address: {
    lineOne: "Tišinska ulica III. odvojak",
    lineTwo: "Jakuševac",
    city: "Zagreb",
    state: "",
    zip: "10020",
    mapLink: "https://maps.app.goo.gl/xX5ZVQLiH57prSWy8",
  },
  socials,
};

export const OG = {
  locale: "hr_HR",
  image: "/assets/social.jpg",
};
