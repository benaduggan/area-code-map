import data from "../../assets/areacodegeojson.json";

export const areaCodeList: AreaCodeInfo[] = data.features;

type AreaCodeInfo = {
  OBJECTID: string;
  NPA: string;
  STATE?: string;
  TYPE?: string;
  PREVNPA?: string;
  COUNTRY?: string;
};

const areaCodeMap: Record<string, AreaCodeInfo> = {};
areaCodeList.forEach((obj) => {
  areaCodeMap[obj["NPA"]] = obj;
});

export { areaCodeMap };

export const stateCodeToName = (code: keyof typeof statesMap) =>
  statesMap[code];

const statesMap = {
  AB: "AB",
  AK: "AK",
  AL: "AL",
  AR: "AR",
  AS: "AS",
  AZ: "AZ",
  BC: "BC",
  CA: "CA",
  CO: "CO",
  CT: "CT",
  DC: "DC",
  DE: "DE",
  FL: "FL",
  GA: "GA",
  GU: "GU",
  HI: "HI",
  IA: "IA",
  ID: "ID",
  IL: "IL",
  IN: "IN",
  KS: "KS",
  KY: "KY",
  LA: "LA",
  MA: "MA",
  MB: "MB",
  MD: "MD",
  ME: "ME",
  MI: "MI",
  MN: "MN",
  MO: "MO",
  MP: "MP",
  MS: "MS",
  MT: "MT",
  NB: "NB",
  NC: "North Carolina",
  ND: "ND",
  NE: "NE",
  NH: "NH",
  NJ: "NJ",
  NL: "NL",
  NM: "NM",
  NT: "NT",
  NV: "NV",
  NY: "NY",
  OH: "OH",
  OK: "OK",
  ON: "ON",
  OR: "OR",
  PA: "PA",
  PR: "PR",
  QC: "QC",
  RI: "RI",
  SC: "SC",
  SD: "SD",
  SK: "SK",
  TN: "TN",
  TX: "TX",
  UT: "UT",
  VA: "VA",
  VI: "VI",
  VT: "VT",
  WA: "WA",
  WI: "WI",
  WV: "West Virginia",
  WY: "WY",
};
