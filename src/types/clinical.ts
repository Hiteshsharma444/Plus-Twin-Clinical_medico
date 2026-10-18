export type RiskCategory = 'low' | 'moderate' | 'high' | 'critical';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bedNumber: string;
  admissionDiagnosis: string;
  history: string[];
  allergies: string[];
  weightKg: number;
  heightCm: number;
  icuDay: number;
  codeStatus: 'FULL CODE' | 'DNR/DNI' | 'DNR';
}

export interface TelemetryVitals {
  heartRate: number; // bpm (e.g. 118)
  systolicBP: number; // mmHg (e.g. 84)
  diastolicBP: number; // mmHg (e.g. 52)
  map: number; // Mean Arterial Pressure mmHg (e.g. 62)
  spo2: number; // % (e.g. 91)
  respRate: number; // breaths/min (e.g. 26)
  temperatureC: number; // Celsius (e.g. 38.9)
  cvp: number; // Central Venous Pressure mmHg (e.g. 6)
  etco2: number; // End-Tidal CO2 mmHg (e.g. 29)
  cardiacOutput: number; // L/min (e.g. 6.8)
  svr: number; // Systemic Vascular Resistance dyn·s·cm⁻⁵ (e.g. 680)
  urineOutputPerHour: number; // mL/hr (e.g. 18)
}

export interface LabPanel {
  lactate: number; // mmol/L (normal < 2.0)
  wbc: number; // x10^3/uL (normal 4.5-11.0)
  procalcitonin: number; // ng/mL (normal < 0.5)
  creatinine: number; // mg/dL (normal 0.7-1.3)
  platelets: number; // x10^3/uL (normal 150-450)
  bilirubin: number; // mg/dL (normal 0.2-1.2)
  pao2: number; // mmHg (e.g. 72)
  fio2: number; // decimal 0.21 - 1.0 (e.g. 0.40)
  baseExcess: number; // mEq/L (e.g. -6.4)
  ph: number; // (e.g. 7.28)
  inr: number; // (e.g. 1.4)
}

export interface SOFASubscores {
  respiration: number; // 0-4
  coagulation: number; // 0-4
  liver: number; // 0-4
  cardiovascular: number; // 0-4
  cns: number; // 0-4 (GCS)
  renal: number; // 0-4
}

export interface ClinicalScores {
  qSOFA: number; // 0-3
  qSOFACriteria: {
    alteredMentalState: boolean;
    systolicBPThreshold: boolean; // SBP <= 100
    highRespRate: boolean; // RR >= 22
  };
  sofa: number; // 0-24
  sofaSubscores: SOFASubscores;
  news2: number; // National Early Warning Score 2 (0-20)
  shockIndex: number; // HR / SBP (normal 0.5-0.7, > 0.9 severe)
  sepsisRiskScore: number; // 0-100% predictive probability
  riskCategory: RiskCategory;
}

export interface InterventionsState {
  crystalloidBolusMl: number; // 0 - 3000 mL
  norepinephrineMcgKgMin: number; // 0.00 - 1.00 mcg/kg/min
  vasopressinUnitsMin: number; // 0.00 or 0.03 units/min
  dobutamineMcgKgMin: number; // 0 - 20 mcg/kg/min
  antibioticsActive: boolean; // Broad spectrum (e.g. Cefepime + Vanc)
  o2DeliveryType: 'Room Air' | 'Nasal Cannula' | 'High Flow Nasal Cannula' | 'BiPAP' | 'Mechanical Ventilation';
  fio2Percent: number; // 21 - 100%
  peepCmH2O: number; // 5 - 18 cmH2O
  hydrocortisoneActive: boolean; // 200mg/day stress dose steroid
}

export interface SimulatedOutcome {
  timeHorizonHours: number; // 1, 4, 12, 24
  predictedVitals: TelemetryVitals;
  predictedScores: ClinicalScores;
  predictedLabs: LabPanel;
  deltaMap: number;
  deltaLactate: number;
  deltaRiskScore: number;
  fluidOverloadRisk: 'low' | 'moderate' | 'high';
  pulmonaryEdemaProbability: number; // %
  clinicalInsights: string[];
  sscGuidelineAdherence: {
    bloodCulturesOrdered: boolean;
    antibioticsWithin1Hour: boolean;
    fluidBolusCompleted: boolean;
    vasopressorForMapTarget: boolean;
    lactateRemeasurementScheduled: boolean;
  };
}

export interface OrganTwinStatus {
  id: 'brain' | 'heart' | 'lungs' | 'kidneys' | 'liver' | 'vascular';
  name: string;
  perfusionIndex: number; // 0 - 100%
  stressLevel: 'normal' | 'compensated' | 'failing' | 'critical';
  sofaScore: number;
  clinicalNotes: string;
  biomarkers: { label: string; value: string; unit: string; alert?: boolean }[];
}

export interface HistoricalDataPoint {
  timestamp: string;
  hour: number;
  heartRate: number;
  map: number;
  lactate: number;
  sepsisRisk: number;
  sofa: number;
  spo2: number;
}
