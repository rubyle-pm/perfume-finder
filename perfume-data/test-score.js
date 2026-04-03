function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreResult(textRaw, entry) {
  const text = normalize(textRaw);
  const targetName = normalize(entry.name);
  const brand = normalize(entry.brand);

  let score = 0;
  if (text.includes(brand)) score += 5;

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

  if (textTokens.length > targetTokens.length) {
    score -= (textTokens.length - targetTokens.length);
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

const texts = [
  "Libre Yves Saint Laurent 2019 1035",
  "Libre Intense Yves Saint Laurent 2020 1035",
  "Coach Coach for Men by fishingforfish"
];

console.log("=== Libre ===");
texts.forEach(t => console.log(`"${t}" =>`, scoreResult(t, entryLibre)));
console.log("\n=== Libre Intense ===");
texts.forEach(t => console.log(`"${t}" =>`, scoreResult(t, entryIntense)));
