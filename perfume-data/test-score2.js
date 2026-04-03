const BRAND_SLUG_MAP = {
  "YSL": "Yves-Saint-Laurent",
  "Dior": "Christian-Dior",
  "Chanel": "Chanel",
  "Chloé": "Chloe",
  "Lancôme": "Lancome",
  "Frédéric Malle": "Frederic-Malle",
  "Dolce & Gabbana": "Dolce-and-Gabbana",
  "Viktor & Rolf": "Viktor-and-Rolf",
  "Maison Francis Kurkdjian": "Maison-Francis-Kurkdjian",
  "Maison Margiela": "Maison-Margiela",
  "Parfums de Marly": "Parfums-de-Marly",
  "Penhaligon's": "Penhaligons",
  "Acqua di Parma": "Acqua-di-Parma",
  "Jo Malone": "Jo-Malone-London",
  "Tom Ford": "Tom-Ford",
  "Le Labo": "Le-Labo",
  "Byredo": "Byredo",
  "Creed": "Creed",
  "Guerlain": "Guerlain",
  "Hermès": "Hermes",
  "Giorgio Armani": "Giorgio-Armani",
  "Givenchy": "Givenchy",
  "Gucci": "Gucci",
  "Prada": "Prada",
  "Paco Rabanne": "Paco-Rabanne",
  "Valentino": "Valentino",
  "Carolina Herrera": "Carolina-Herrera",
  "Jean Paul Gaultier": "Jean-Paul-Gaultier",
  "Narciso Rodriguez": "Narciso-Rodriguez",
  "Mugler": "Thierry-Mugler",
  "Bvlgari": "Bvlgari",
  "Cartier": "Cartier",
  "Loewe": "Loewe",
  "Diptyque": "Diptyque",
  "Kilian": "By-Kilian",
  "Amouage": "Amouage",
  "Initio Parfums": "Initio-Parfums-Prives",
  "Xerjoff": "Xerjoff",
  "Roja Parfums": "Roja-Parfums",
  "Serge Lutens": "Serge-Lutens",
  "Atelier Cologne": "Atelier-Cologne",
  "Clive Christian": "Clive-Christian",
  "Ex Nihilo": "Ex-Nihilo",
  "Juliette Has A Gun": "Juliette-Has-a-Gun",
  "Memo Paris": "Memo",
  "Vilhelm Parfumerie": "Vilhelm-Parfumerie",
};

function getBrandSlug(brand) {
  return BRAND_SLUG_MAP[brand] || brand.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreResult(textRaw, entry) {
  const text = normalize(textRaw);
  const targetName = normalize(entry.name);
  const brand = normalize(entry.brand);
  
  // also check full brand name from slug map
  const fullBrandName = normalize(getBrandSlug(entry.brand).replace(/-/g, " "));

  let score = 0;
  if (text.includes(brand) || text.includes(fullBrandName)) score += 5;

  const baseName = normalize(entry.name.replace(/\b(edp|edt|parfum|intense|extreme|elixir|absolu)\b/gi, ""));
  const baseTokens = baseName.split(" ").filter(Boolean);
  
  let matchCount = 0;
  baseTokens.forEach(token => {
    if (text.includes(token)) matchCount++;
  });

  if (matchCount === 0) return -100;
  else score += (matchCount * 3);

  const variantWords = ["intense", "extreme", "elixir", "edition", "collector", "limited", "absolu", "absolue"];
  const textTokens = text.split(" ").filter(Boolean);
  const targetTokens = targetName.split(" ").filter(Boolean);
  
  variantWords.forEach(variant => {
    const wantsVariant = targetTokens.includes(variant);
    const hasVariant = textTokens.includes(variant);
    
    if (wantsVariant && hasVariant) score += 10;
    if (wantsVariant && !hasVariant) score -= 10;
    if (!wantsVariant && hasVariant) score -= 10;
  });

  if (entry.concentration === "EDT") {
    if (text.includes("eau de toilette") || text.includes("edt")) score += 8;
    if (text.includes("eau de parfum") || text.includes("edp")) score -= 10;
  }
  
  if (entry.concentration === "EDP") {
    if (text.includes("eau de parfum") || text.includes("edp")) score += 8;
    if (text.includes("eau de toilette") || text.includes("edt")) score -= 10;
  }

  const isTargetFem = entry.gender === "feminine";
  const isTargetMasc = entry.gender === "masculine";

  const paddedText = ` ${text} `;
  const hasWomen = /\b(women|woman|pour femme|for her)\b/.test(paddedText);
  const hasMen = /\b(men|man|pour homme|for him)\b/.test(paddedText);

  if (isTargetFem) {
    if (hasWomen) score += 5;
    if (hasMen && !hasWomen) score -= 15;
  } else if (isTargetMasc) {
    if (hasMen) score += 5;
    if (hasWomen && !hasMen) score -= 15;
  }

  // To not let the extra words penalty overrun correctly found names,
  // we can cap the extra words penalty or subtract only non-brand extra words.
  // Actually, let's deduct words that belong to the fullBrandName and baseName from textTokens before penalizing
  const textWithoutBrand = text.replace(new RegExp(`\\b(${fullBrandName}|${brand})\\b`, 'gi'), '');
  const remainingTextTokens = textWithoutBrand.split(" ").filter(Boolean);
  
  if (remainingTextTokens.length > targetTokens.length) {
    // Only dock up to -5 to prevent total ruin by random Fragrantica dates (like "2015 3000 votes")
    const diff = remainingTextTokens.length - targetTokens.length;
    score -= Math.min(diff, 5);
  }

  return score;
}

const entryLibre = {
  id: "ysl-libre-edp",
  name: "Libre EDP",
  brand: "YSL",
  concentration: "EDP",
  gender: "feminine"
};
const entryIntense = {
  id: "ysl-libre-intense-edp",
  name: "Libre Intense EDP",
  brand: "YSL",
  concentration: "EDP",
  gender: "feminine"
};

const t1 = "Libre Yves Saint Laurent 2019 1035";
const t2 = "Libre Intense Yves Saint Laurent 2020 1035";

console.log("=== Libre ===");
console.log(`"${t1}" =>`, scoreResult(t1, entryLibre));
console.log(`"${t2}" =>`, scoreResult(t2, entryLibre));

console.log("\n=== Libre Intense ===");
console.log(`"${t1}" =>`, scoreResult(t1, entryIntense));
console.log(`"${t2}" =>`, scoreResult(t2, entryIntense));
