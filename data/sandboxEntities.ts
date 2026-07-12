export interface SandboxTestVehicle { plate: string; make: string; model: string; color: string; }
export interface SandboxTestCustomer { id: string; name: string; wallet: string; }
export interface SandboxTestLocation { id: string; name: string; type: "Toll Gate" | "Parking" | "Fuel Station" | "EV Charger" | "Car Wash"; }
export interface SandboxTestMerchant { id: string; name: string; category: string; }

export const SEED_TEST_VEHICLES: SandboxTestVehicle[] = [
  { plate: "A 12345", make: "Toyota", model: "Camry", color: "White" },
  { plate: "D 88213", make: "Nissan", model: "Patrol", color: "Black" },
  { plate: "P 55210", make: "Tesla", model: "Model Y", color: "Blue" },
  { plate: "F 74021", make: "Lexus", model: "ES 300", color: "Silver" },
  { plate: "S 30918", make: "Mercedes-Benz", model: "GLE", color: "Grey" },
];

export const SEED_TEST_CUSTOMERS: SandboxTestCustomer[] = [
  { id: "cus_4M2K9QXZ", name: "Rashid Al Mansoori", wallet: "wal_9K2QZX7M" },
  { id: "cus_71QK9XZM", name: "Fatima Al Zaabi", wallet: "wal_20QK9XZM" },
  { id: "cus_82KQ9XZM", name: "Mohammed Al Hashimi", wallet: "wal_55QK9XZM" },
];

export const SEED_TEST_TOLL_GATES: SandboxTestLocation[] = [
  { id: "gate_al_barsha", name: "Al Barsha", type: "Toll Gate" },
  { id: "gate_al_safa", name: "Al Safa", type: "Toll Gate" },
  { id: "gate_al_maktoum", name: "Al Maktoum Bridge", type: "Toll Gate" },
];

export const SEED_TEST_PARKING: SandboxTestLocation[] = [
  { id: "zone_dxb_mall_l2", name: "Dubai Mall — Level 2", type: "Parking" },
  { id: "zone_marina_walk", name: "Dubai Marina Walk", type: "Parking" },
];

export const SEED_TEST_FUEL_STATIONS: SandboxTestLocation[] = [
  { id: "stn_enoc_jlt_04", name: "ENOC — JLT Station 04", type: "Fuel Station" },
  { id: "stn_adnoc_marina_02", name: "ADNOC — Marina Station 02", type: "Fuel Station" },
];

export const SEED_TEST_EV_CHARGERS: SandboxTestLocation[] = [
  { id: "chg_dubai_marina_03", name: "Dubai Marina Charger 03", type: "EV Charger" },
  { id: "chg_business_bay_01", name: "Business Bay Charger 01", type: "EV Charger" },
];

export const SEED_TEST_CARWASH: SandboxTestLocation[] = [
  { id: "cw_jbr_01", name: "Washmen — JBR", type: "Car Wash" },
  { id: "cw_downtown_02", name: "Washmen — Downtown", type: "Car Wash" },
];

export const SEED_TEST_MERCHANTS: SandboxTestMerchant[] = [
  { id: "mer_enoc", name: "ENOC", category: "Fuel Retailer" },
  { id: "mer_dubaimall", name: "Dubai Mall", category: "Retail & Mall" },
  { id: "mer_dewa", name: "DEWA", category: "Utilities" },
];
