/**
 * Maps the NANPA LOCATION column onto a short region code, a display name,
 * and a country. NANPA uses postal abbreviations for US states, full names
 * for Canadian provinces, and country names for the Caribbean.
 */
export interface Region {
  code: string;
  name: string;
  country: string;
}

const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  // Territories
  PR: "Puerto Rico",
  VI: "U.S. Virgin Islands",
  GU: "Guam",
  AS: "American Samoa",
  CNMI: "Northern Mariana Islands",
};

const US_TERRITORY_CODES: Record<string, string> = { CNMI: "MP" };

const CANADA: Record<string, Region> = {
  ALBERTA: { code: "AB", name: "Alberta", country: "CA" },
  "BRITISH COLUMBIA": { code: "BC", name: "British Columbia", country: "CA" },
  MANITOBA: { code: "MB", name: "Manitoba", country: "CA" },
  "NEW BRUNSWICK": { code: "NB", name: "New Brunswick", country: "CA" },
  "NEWFOUNDLAND AND LABRADOR": { code: "NL", name: "Newfoundland and Labrador", country: "CA" },
  "NOVA SCOTIA - PRINCE EDWARD ISLAND": {
    code: "NS/PE",
    name: "Nova Scotia & Prince Edward Island",
    country: "CA",
  },
  "NORTHWEST TERRITORIES -YUKON - NUNAVUT": {
    code: "NT/YT/NU",
    name: "Northwest Territories, Yukon & Nunavut",
    country: "CA",
  },
  ONTARIO: { code: "ON", name: "Ontario", country: "CA" },
  QUEBEC: { code: "QC", name: "Quebec", country: "CA" },
  SASKATCHEWAN: { code: "SK", name: "Saskatchewan", country: "CA" },
};

const CARIBBEAN: Record<string, string> = {
  ANGUILLA: "Anguilla",
  "ANTIGUA/BARBUDA": "Antigua and Barbuda",
  BAHAMAS: "Bahamas",
  BARBADOS: "Barbados",
  BERMUDA: "Bermuda",
  "BRITISH VIRGIN ISLANDS": "British Virgin Islands",
  "CAYMAN ISLANDS": "Cayman Islands",
  DOMINICA: "Dominica",
  "DOMINICAN REPUBLIC": "Dominican Republic",
  GRENADA: "Grenada",
  JAMAICA: "Jamaica",
  MONTSERRAT: "Montserrat",
  "SINT MAARTEN": "Sint Maarten",
  "ST. KITTS & NEVIS": "Saint Kitts and Nevis",
  "ST. LUCIA": "Saint Lucia",
  "ST. VINCENT & GRENADINES": "Saint Vincent and the Grenadines",
  "TRINIDAD & TOBAGO": "Trinidad and Tobago",
  "TURKS & CAICOS ISLANDS": "Turks and Caicos Islands",
};

export function regionForLocation(location: string, country: string): Region {
  const loc = location.trim();
  const usName = US_STATES[loc];
  if (usName && country === "US") {
    return { code: US_TERRITORY_CODES[loc] ?? loc, name: usName, country: "US" };
  }
  const ca = CANADA[loc];
  if (ca) return ca;
  const carib = CARIBBEAN[loc];
  if (carib) return { code: carib, name: carib, country: carib };
  throw new Error(`Unknown NANPA LOCATION "${location}" (country ${country})`);
}
