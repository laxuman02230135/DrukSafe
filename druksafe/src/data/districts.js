export const DEFAULT_ALERT_PHONE = "77459910";

export const ALERT_RECIPIENTS = [
  {
    id: "prototype-phone",
    label: "Prototype phone",
    phone: DEFAULT_ALERT_PHONE,
  },
];

export const DISTRICTS = [
  {
    id: "punakha",
    name: "Punakha",
    dzongkha: "སྤུ་ན་ཁ་",
    latitude: 27.5916,
    longitude: 89.8774,
    vulnerability: 0.84,
    sensitivity: 1.12,
    basin: "Pho Chhu / Mo Chhu",
    river: "Pho Chhu",
    population: "82k",
    lead: "Dzongkhag disaster focal point",
    rainfall: 42,
    riverRise: 14,
    map: { left: "49%", top: "35%" },
    history: [18, 24, 31, 38, 44, 49, 45, 42, 36, 30, 27, 23],
  },
  {
    id: "sarpang",
    name: "Sarpang",
    dzongkha: "གསར་སྤང་",
    latitude: 26.8639,
    longitude: 90.2675,
    vulnerability: 0.91,
    sensitivity: 1.26,
    basin: "Mao Khola / Sarpang Chhu",
    river: "Sarpang Chhu",
    population: "46k",
    lead: "Southern response cell",
    rainfall: 78,
    riverRise: 24,
    map: { left: "70%", top: "72%" },
    history: [31, 44, 57, 71, 83, 95, 88, 78, 66, 55, 46, 39],
  },
  {
    id: "samtse",
    name: "Samtse",
    dzongkha: "བསམ་རྩེ་",
    latitude: 26.8997,
    longitude: 89.0991,
    vulnerability: 0.78,
    sensitivity: 1.16,
    basin: "Amo Chhu",
    river: "Amo Chhu",
    population: "61k",
    lead: "Local leaders and farm groups",
    rainfall: 55,
    riverRise: 17,
    map: { left: "25%", top: "66%" },
    history: [18, 26, 39, 50, 58, 64, 60, 55, 49, 42, 35, 29],
  },
  {
    id: "zhemgang",
    name: "Zhemgang",
    dzongkha: "གཞམས་སྒང་",
    latitude: 27.2169,
    longitude: 90.6579,
    vulnerability: 0.82,
    sensitivity: 1.2,
    basin: "Mangde Chhu",
    river: "Mangde Chhu",
    population: "24k",
    lead: "Gewog administrators",
    rainfall: 64,
    riverRise: 20,
    map: { left: "78%", top: "54%" },
    history: [22, 30, 43, 55, 68, 74, 70, 64, 57, 48, 38, 32],
  },
];

export function getDistrictById(id) {
  return DISTRICTS.find((district) => district.id === id) ?? null;
}

export function getDistrictByName(name) {
  const normalizedName = String(name ?? "").trim().toLowerCase();

  return (
    DISTRICTS.find(
      (district) =>
        district.id === normalizedName ||
        district.name.toLowerCase() === normalizedName
    ) ?? null
  );
}
