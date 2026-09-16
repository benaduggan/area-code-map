import { aggregateContacts } from "../contacts/aggregate";
import type { Contact, ImportResult } from "../contacts/types";
import type { MessageKey } from "../i18n";

export type ExampleId = "maya" | "devon" | "jordan";

export interface Example {
  id: ExampleId;
  nameKey: MessageKey;
  blurbKey: MessageKey;
  home: string;
  spread: Readonly<Record<string, number>>;
  offMap: readonly string[];
}

const MAYA: Example = {
  id: "maya",
  nameKey: "examples.maya.name",
  blurbKey: "examples.maya.blurb",
  home: "919",
  spread: {
    "919": 40,
    "984": 18,
    "336": 7,
    "704": 10,
    "980": 4,
    "910": 5,
    "252": 3,
    "828": 3,
    "347": 15,
    "718": 13,
    "917": 12,
    "929": 6,
    "646": 8,
    "212": 7,
    "201": 3,
    "203": 3,
    "617": 6,
    "857": 3,
    "215": 4,
    "202": 6,
    "703": 3,
    "404": 4,
    "470": 2,
    "843": 3,
    "803": 2,
    "757": 3,
    "804": 2,
    "305": 3,
    "615": 3,
    "312": 3,
    "773": 2,
    "415": 3,
    "510": 2,
    "206": 3,
    "512": 3,
    "303": 2,
    "702": 2,
    "808": 2,
    "416": 2,
    "787": 2,
  },
  offMap: ["+44 20 7946 0958", "+353 1 437 0000", "800-555-0166", "(888) 555-0110", "555-0134"],
};

const DEVON: Example = {
  id: "devon",
  nameKey: "examples.devon.name",
  blurbKey: "examples.devon.blurb",
  home: "312",
  spread: {
    "312": 32,
    "773": 26,
    "872": 7,
    "847": 11,
    "630": 8,
    "708": 9,
    "815": 4,
    "217": 3,
    "309": 3,
    "414": 6,
    "608": 3,
    "317": 3,
    "313": 5,
    "216": 3,
    "614": 3,
    "415": 14,
    "510": 11,
    "650": 8,
    "408": 6,
    "628": 3,
    "925": 3,
    "707": 2,
    "206": 5,
    "503": 3,
    "702": 2,
    "480": 3,
    "602": 2,
    "917": 7,
    "646": 4,
    "212": 4,
    "718": 3,
    "617": 4,
    "404": 3,
    "512": 3,
    "303": 3,
    "615": 2,
    "919": 3,
    "416": 2,
  },
  offMap: ["+52 55 1234 5678", "+81 3 3224 5000", "833-555-0121", "555-0199"],
};

const JORDAN: Example = {
  id: "jordan",
  nameKey: "examples.jordan.name",
  blurbKey: "examples.jordan.blurb",
  home: "416",
  spread: {
    "416": 40,
    "647": 24,
    "437": 8,
    "905": 18,
    "289": 9,
    "519": 8,
    "613": 7,
    "705": 5,
    "807": 2,
    "514": 12,
    "438": 6,
    "450": 4,
    "418": 3,
    "819": 2,
    "604": 9,
    "778": 5,
    "250": 3,
    "403": 6,
    "587": 3,
    "780": 4,
    "204": 2,
    "306": 2,
    "902": 5,
    "709": 2,
    "212": 5,
    "917": 5,
    "718": 3,
    "617": 4,
    "312": 4,
    "206": 3,
    "415": 4,
    "305": 2,
    "702": 2,
  },
  offMap: ["+44 161 496 0000", "+33 1 70 18 99 00", "877-555-0142", "(866) 555-0173"],
};

const EXAMPLES_BY_ID: Record<ExampleId, Example> = {
  maya: MAYA,
  devon: DEVON,
  jordan: JORDAN,
};

export const EXAMPLES: readonly Example[] = Object.values(EXAMPLES_BY_ID);

export function getExample(id: ExampleId): Example {
  return EXAMPLES_BY_ID[id];
}

export function examplePairs(): [Example, Example][] {
  const pairs: [Example, Example][] = [];
  for (let i = 0; i < EXAMPLES.length; i++) {
    for (let j = i + 1; j < EXAMPLES.length; j++) pairs.push([EXAMPLES[i]!, EXAMPLES[j]!]);
  }
  return pairs;
}

export function exampleSize(example: Example): { numbers: number; codes: number } {
  const values = Object.values(example.spread);
  return {
    numbers: values.reduce((a, b) => a + b, 0),
    codes: values.length,
  };
}

const FIRST = [
  "Alex",
  "Amara",
  "Bea",
  "Carlos",
  "Dana",
  "Elena",
  "Femi",
  "Grace",
  "Hana",
  "Ibrahim",
  "Jules",
  "Kenji",
  "Lena",
  "Marcus",
  "Nadia",
  "Omar",
  "Priya",
  "Quinn",
  "Rosa",
  "Sam",
  "Tomás",
  "Uma",
  "Viv",
  "Wes",
  "Yara",
  "Zeke",
];

const LAST = [
  "Adeyemi",
  "Baptiste",
  "Carver",
  "Delgado",
  "Ellis",
  "Fontaine",
  "Gallagher",
  "Hoang",
  "Iverson",
  "Jain",
  "Kowalski",
  "Lindqvist",
  "Moreau",
  "Nakamura",
  "Okafor",
  "Petrov",
  "Ruiz",
  "Santos",
  "Tremblay",
  "Ueda",
  "Vargas",
  "Whitfield",
];

function nameFor(npa: string, i: number): string {
  const seed = Number(npa);
  return `${FIRST[(seed + i * 7) % FIRST.length]} ${LAST[(seed * 3 + i * 5) % LAST.length]}`;
}

function contactsFor(example: Example): Contact[] {
  const contacts: Contact[] = [];
  for (const [npa, count] of Object.entries(example.spread)) {
    for (let i = 0; i < count; i++) {
      contacts.push({ name: nameFor(npa, i), phones: [`(${npa}) 555-0${100 + i}`] });
    }
  }
  for (const [i, raw] of example.offMap.entries()) {
    contacts.push({ name: nameFor("555", i), phones: [raw] });
  }
  return contacts;
}

const cache = new Map<ExampleId, ImportResult>();

export function buildExample(id: ExampleId): ImportResult {
  const cached = cache.get(id);
  if (cached) return cached;
  const result = aggregateContacts(contactsFor(getExample(id)), "example");
  cache.set(id, result);
  return result;
}
