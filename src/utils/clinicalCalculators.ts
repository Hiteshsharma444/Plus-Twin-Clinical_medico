import type {
  ClinicalScores,
  InterventionsState,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  RiskCategory,
  SimulatedOutcome,
  SOFASubscores,
  TelemetryVitals,
} from '../types/clinical.js';

/**
 * Calculates Quick SOFA (qSOFA) score (0 - 3)
 * Criteria:
 * 1. Altered mental status (GCS < 15)
 * 2. Systolic blood pressure <= 100 mmHg
 * 3. Respiratory rate >= 22 breaths/min
 */
export function calculateQSOFA(
  systolicBP: number,
  respRate: number,
  alteredMentalState: boolean
): {
  score: number;
  criteria: {
    alteredMentalState: boolean;
    systolicBPThreshold: boolean;
    highRespRate: boolean;
  };
} {
  const systolicBPThreshold = systolicBP <= 100;
  const highRespRate = respRate >= 22;

  let score = 0;
  if (alteredMentalState) score += 1;
  if (systolicBPThreshold) score += 1;
  if (highRespRate) score += 1;

  return {
    score,
    criteria: {
      alteredMentalState,
      systolicBPThreshold,
      highRespRate,
    },
  };
}

/**
 * Calculates Sequential Organ Failure Assessment (SOFA) score (0 - 24)
 * Based on Vincent JL et al. & Surviving Sepsis Campaign 2021/2026.
 */
export function calculateSOFA(
  vitals: Pick<TelemetryVitals, 'map' | 'urineOutputPerHour'>,
  labs: Pick<LabPanel, 'pao2' | 'fio2' | 'platelets' | 'bilirubin' | 'creatinine'>,
  vasopressorDose: { norepinephrine: number; dobutamine: number },
  gcsScore = 14
): { total: number; subscores: SOFASubscores } {
  // 1. Respiration: PaO2 / FiO2 ratio
  const pfRatio = labs.fio2 > 0 ? labs.pao2 / labs.fio2 : 400;
  let respiration = 0;
  if (pfRatio < 100) respiration = 4;
  else if (pfRatio < 200) respiration = 3;
  else if (pfRatio < 300) respiration = 2;
  else if (pfRatio < 400) respiration = 1;

  // 2. Coagulation: Platelets (x10^3/uL)
  let coagulation = 0;
  if (labs.platelets < 20) coagulation = 4;
  else if (labs.platelets < 50) coagulation = 3;
  else if (labs.platelets < 100) coagulation = 2;
  else if (labs.platelets < 150) coagulation = 1;

  // 3. Liver: Bilirubin (mg/dL)
  let liver = 0;
  if (labs.bilirubin >= 12.0) liver = 4;
  else if (labs.bilirubin >= 6.0) liver = 3;
  else if (labs.bilirubin >= 2.0) liver = 2;
  else if (labs.bilirubin >= 1.2) liver = 1;

  // 4. Cardiovascular: MAP or vasopressor requirements
  let cardiovascular = 0;
  if (vasopressorDose.norepinephrine > 0.1) {
    cardiovascular = 4;
  } else if (vasopressorDose.norepinephrine > 0) {
    cardiovascular = 3;
  } else if (vasopressorDose.dobutamine > 0) {
    cardiovascular = 2;
  } else if (vitals.map < 70) {
    cardiovascular = 1;
  }

  // 5. Central Nervous System: Glasgow Coma Scale
  let cns = 0;
  if (gcsScore < 6) cns = 4;
  else if (gcsScore <= 9) cns = 3;
  else if (gcsScore <= 12) cns = 2;
  else if (gcsScore <= 14) cns = 1;

  // 6. Renal: Creatinine (mg/dL) or daily urine output
  let renal = 0;
  if (labs.creatinine >= 5.0 || vitals.urineOutputPerHour < 8) renal = 4;
  else if (labs.creatinine >= 3.5 || vitals.urineOutputPerHour < 20) renal = 3;
  else if (labs.creatinine >= 2.0) renal = 2;
  else if (labs.creatinine >= 1.2) renal = 1;

  const subscores: SOFASubscores = {
    respiration,
    coagulation,
    liver,
    cardiovascular,
    cns,
    renal,
  };

  const total = respiration + coagulation + liver + cardiovascular + cns + renal;

  return { total, subscores };
}

/**
 * Calculates NEWS2 (National Early Warning Score 2)
 */
export function calculateNEWS2(
  vitals: Pick<TelemetryVitals, 'respRate' | 'spo2' | 'temperatureC' | 'systolicBP' | 'heartRate'>,
  onSupplementalOxygen = false,
  alteredConsciousness = false
): number {
  let score = 0;

  // Respiration Rate
  if (vitals.respRate <= 8 || vitals.respRate >= 25) score += 3;
  else if (vitals.respRate >= 21) score += 2;
  else if (vitals.respRate <= 11) score += 1;

  // SpO2 Scale 1
  if (vitals.spo2 <= 91) score += 3;
  else if (vitals.spo2 <= 93) score += 2;
  else if (vitals.spo2 <= 95) score += 1;

  // Supplemental Oxygen
  if (onSupplementalOxygen) score += 2;

  // Systolic BP
  if (vitals.systolicBP <= 90 || vitals.systolicBP >= 220) score += 3;
  else if (vitals.systolicBP <= 100) score += 2;
  else if (vitals.systolicBP <= 110) score += 1;

  // Pulse / Heart Rate
  if (vitals.heartRate <= 40 || vitals.heartRate >= 131) score += 3;
  else if (vitals.heartRate >= 111) score += 2;
  else if (vitals.heartRate <= 50 || vitals.heartRate >= 91) score += 1;

  // Consciousness
  if (alteredConsciousness) score += 3;

  // Temperature
  if (vitals.temperatureC <= 35.0) score += 3;
  else if (vitals.temperatureC >= 39.1) score += 2;
  else if (vitals.temperatureC <= 36.0 || vitals.temperatureC >= 38.1) score += 1;

  return score;
}

/**
 * Calculates Shock Index (HR / SBP).
 * Normal: 0.5 - 0.7.
 * > 0.9 strongly predicts occult shock, hyperlactatemia, and ICU mortality.
 */
export function calculateShockIndex(heartRate: number, systolicBP: number): number {
  if (systolicBP <= 0) return 2.0;
  return Number((heartRate / systolicBP).toFixed(2));
}

/**
 * Comprehensive Sepsis Risk Score (0 - 100%)
 * Combines dynamic physiological hemodynamics, tissue hypoperfusion (lactate kinetics),
 * organ dysfunction (SOFA), and systemic inflammatory response (SIRS/NEWS2).
 */
export function calculateSepsisRiskScore(
  vitals: TelemetryVitals,
  labs: LabPanel,
  sofaTotal: number,
  shockIndex: number
): { score: number; category: RiskCategory } {
  let riskPoints = 0;

  // 1. Hemodynamic instability (up to 30 pts)
  if (vitals.map < 65) riskPoints += 25;
  else if (vitals.map < 70) riskPoints += 15;
  else if (vitals.map < 75) riskPoints += 8;

  if (shockIndex >= 1.2) riskPoints += 15;
  else if (shockIndex >= 0.9) riskPoints += 10;
  else if (shockIndex >= 0.7) riskPoints += 4;

  // 2. Tissue Hypoperfusion & Metabolic Acidosis (up to 25 pts)
  if (labs.lactate >= 4.0) riskPoints += 25;
  else if (labs.lactate >= 2.5) riskPoints += 16;
  else if (labs.lactate >= 2.0) riskPoints += 8;

  if (labs.ph < 7.30) riskPoints += 8;
  if (labs.baseExcess <= -5.0) riskPoints += 6;

  // 3. Organ Dysfunction Burden (SOFA score) (up to 25 pts)
  if (sofaTotal >= 10) riskPoints += 25;
  else if (sofaTotal >= 6) riskPoints += 18;
  else if (sofaTotal >= 3) riskPoints += 10;
  else if (sofaTotal >= 2) riskPoints += 5;

  // 4. Inflammatory & Immune Dysregulation (up to 20 pts)
  if (labs.procalcitonin >= 2.0) riskPoints += 12;
  else if (labs.procalcitonin >= 0.5) riskPoints += 6;

  if (labs.wbc > 15.0 || labs.wbc < 4.0) riskPoints += 8;

  // Temperature dysregulation (hypothermia in sepsis is especially ominous)
  if (vitals.temperatureC < 36.0) riskPoints += 10;
  else if (vitals.temperatureC > 38.5) riskPoints += 6;

  const score = Math.min(100, Math.max(5, Math.round(riskPoints)));

  let category: RiskCategory = 'low';
  if (score >= 75) category = 'critical';
  else if (score >= 50) category = 'high';
  else if (score >= 25) category = 'moderate';

  return { score, category };
}

/**
 * Computes all clinical scores from current patient telemetry and lab status
 */
export function computeAllScores(
  vitals: TelemetryVitals,
  labs: LabPanel,
  vasopressors = { norepinephrine: 0, dobutamine: 0 },
  alteredMentalState = false
): ClinicalScores {
  const qsofaResult = calculateQSOFA(vitals.systolicBP, vitals.respRate, alteredMentalState);
  const sofaResult = calculateSOFA(vitals, labs, vasopressors, alteredMentalState ? 12 : 15);
  const news2Score = calculateNEWS2(vitals, vitals.spo2 < 95, alteredMentalState);
  const shockIndex = calculateShockIndex(vitals.heartRate, vitals.systolicBP);
  const { score: sepsisRiskScore, category: riskCategory } = calculateSepsisRiskScore(
    vitals,
    labs,
    sofaResult.total,
    shockIndex
  );

  return {
    qSOFA: qsofaResult.score,
    qSOFACriteria: qsofaResult.criteria,
    sofa: sofaResult.total,
    sofaSubscores: sofaResult.subscores,
    news2: news2Score,
    shockIndex,
    sepsisRiskScore,
    riskCategory,
  };
}

/**
 * Pharmacophysiological Counterfactual Simulator
 * Simulates hemodynamics, organ perfusion, and lactate clearance across time horizons
 * based on clinical interventions (Fluids, Norepi, Vasopressin, Dobutamine, Antibiotics, PEEP/FiO2).
 */
export function simulateInterventions(
  baselineVitals: TelemetryVitals,
  baselineLabs: LabPanel,
  interventions: InterventionsState,
  patient: Pick<PatientProfile, 'weightKg'>,
  timeHorizonHours = 4
): SimulatedOutcome {
  const weight = patient.weightKg || 75;
  const recommendedFluidMl = Math.round(weight * 30); // Surviving Sepsis Campaign: 30 mL/kg

  // --- 1. Hemodynamic Response ---
  // Fluid responsiveness: Diminishing returns Frank-Starling curve
  // Fluid bolus increases preload (CVP) and Stroke Volume / Cardiac Output until plateau
  const fluidDoseRatio = interventions.crystalloidBolusMl / Math.max(1, recommendedFluidMl);
  const effectiveFluidGain = Math.min(1.4, fluidDoseRatio);

  let deltaMapFromFluids = 0;
  let deltaCvpFromFluids = 0;
  if (interventions.crystalloidBolusMl > 0) {
    deltaMapFromFluids = 12 * Math.tanh(effectiveFluidGain * 1.5);
    deltaCvpFromFluids = (interventions.crystalloidBolusMl / 500) * 1.8;
  }

  // Vasopressors: Norepinephrine acts on alpha-1 (increases SVR & MAP) and mild beta-1
  // Norepi dose range 0.05 to 0.5 mcg/kg/min typically raises MAP by 15-40 mmHg
  const norepiDose = interventions.norepinephrineMcgKgMin;
  const deltaMapFromNorepi = norepiDose > 0 ? 38 * Math.tanh(norepiDose * 4.5) : 0;
  const deltaSvrFromNorepi = norepiDose > 0 ? Math.round(norepiDose * 750) : 0;

  // Vasopressin (V1 receptor agonist): synergistic, 0.03 U/min raises MAP by 8-12 mmHg
  const deltaMapFromVaso = interventions.vasopressinUnitsMin > 0 ? 9.5 : 0;

  // Inotrope: Dobutamine acts on beta-1 (increases CO, slight vasodilation decreasing SVR)
  const dobutamineDose = interventions.dobutamineMcgKgMin;
  const deltaCoFromDobutamine = dobutamineDose > 0 ? Number((dobutamineDose * 0.18).toFixed(1)) : 0;

  // Steroids: Restores adrenergic sensitivity in refractory septic shock
  const deltaMapFromSteroids = interventions.hydrocortisoneActive ? 5 : 0;

  // Projected MAP
  const projectedMap = Math.min(
    115,
    Math.max(
      45,
      Math.round(
        baselineVitals.map +
          deltaMapFromFluids +
          deltaMapFromNorepi +
          deltaMapFromVaso +
          deltaMapFromSteroids
      )
    )
  );

  // Projected SBP & DBP reconstructed from MAP (MAP ≈ DBP + 1/3 PulsePressure)
  const pulsePressure = Math.max(30, Math.round(baselineVitals.systolicBP - baselineVitals.diastolicBP));
  const projectedDiastolic = Math.max(40, Math.round(projectedMap - pulsePressure / 3));
  const projectedSystolic = Math.round(projectedDiastolic + pulsePressure + (deltaMapFromNorepi * 0.4));

  // Projected Heart Rate: Tachycardia resolves as stroke volume and MAP improve
  let hrReduction = 0;
  if (projectedMap >= 65 && baselineVitals.map < 65) {
    hrReduction += 14;
  }
  if (interventions.crystalloidBolusMl >= 1000) {
    hrReduction += 8;
  }
  const projectedHr = Math.max(68, Math.min(150, baselineVitals.heartRate - hrReduction));

  // Projected CVP
  const projectedCvp = Math.min(22, Math.max(2, Math.round(baselineVitals.cvp + deltaCvpFromFluids)));

  // Projected Cardiac Output
  const projectedCo = Math.max(
    3.0,
    Math.min(
      11.0,
      Number(
        (
          baselineVitals.cardiacOutput +
          deltaCoFromDobutamine +
          (deltaMapFromFluids > 5 ? 0.8 : 0)
        ).toFixed(1)
      )
    )
  );

  // Projected SVR (dyn·s·cm⁻⁵)
  const projectedSvr = Math.max(
    450,
    Math.min(1800, baselineVitals.svr + deltaSvrFromNorepi + (interventions.vasopressinUnitsMin > 0 ? 120 : 0))
  );

  // Projected Urine Output (improved renal perfusion when MAP >= 65)
  let projectedUrine = baselineVitals.urineOutputPerHour;
  if (projectedMap >= 65) {
    const renalPerfGain = (projectedMap - 65) * 1.5;
    projectedUrine = Math.min(110, Math.round(baselineVitals.urineOutputPerHour + 15 + renalPerfGain));
  } else {
    projectedUrine = Math.max(5, Math.round(baselineVitals.urineOutputPerHour * 0.85));
  }

  // --- 2. Lactate Kinetics & Cellular Perfusion ---
  // Surviving Sepsis Campaign target: >= 20% lactate clearance every 2-4 hours
  let lactateClearanceRate = 0.05; // baseline slow clearance
  if (projectedMap >= 65) lactateClearanceRate += 0.15;
  if (interventions.antibioticsActive) lactateClearanceRate += 0.20;
  if (interventions.crystalloidBolusMl >= 1000) lactateClearanceRate += 0.10;

  const clearanceMultiplier = Math.min(0.70, lactateClearanceRate * (timeHorizonHours / 4));
  const projectedLactate = Number(
    Math.max(0.9, baselineLabs.lactate * (1 - clearanceMultiplier)).toFixed(2)
  );

  // Acid-Base status recovery
  const projectedPh = Number(
    Math.min(7.42, baselineLabs.ph + (projectedLactate < baselineLabs.lactate ? 0.06 : -0.04)).toFixed(2)
  );
  const projectedBe = Number(
    Math.min(1.0, baselineLabs.baseExcess + (projectedLactate < baselineLabs.lactate ? 2.5 : -1.5)).toFixed(1)
  );

  // --- 3. Pulmonary Status & Fluid Overload Risk ---
  // High fluid volume in setting of elevated CVP or capillary leak worsens PaO2/FiO2
  let fluidOverloadRisk: 'low' | 'moderate' | 'high' = 'low';
  let pulmonaryEdemaProb = 5;

  if (projectedCvp > 14 || interventions.crystalloidBolusMl > recommendedFluidMl * 1.3) {
    fluidOverloadRisk = 'high';
    pulmonaryEdemaProb = 55;
  } else if (projectedCvp > 10 || interventions.crystalloidBolusMl > recommendedFluidMl) {
    fluidOverloadRisk = 'moderate';
    pulmonaryEdemaProb = 25;
  }

  let projectedPao2 = baselineLabs.pao2;
  const currentFio2 = interventions.fio2Percent / 100;
  if (currentFio2 > baselineLabs.fio2) {
    projectedPao2 = Math.min(220, Math.round(baselineLabs.pao2 + (currentFio2 - baselineLabs.fio2) * 200));
  }
  if (fluidOverloadRisk === 'high') {
    projectedPao2 = Math.max(55, projectedPao2 - 20); // pulmonary shunt from extravasation
  }

  const projectedVitals: TelemetryVitals = {
    heartRate: projectedHr,
    systolicBP: projectedSystolic,
    diastolicBP: projectedDiastolic,
    map: projectedMap,
    spo2: Math.min(100, Math.max(84, Math.round(baselineVitals.spo2 + (projectedPao2 > baselineLabs.pao2 ? 4 : 0)))),
    respRate: Math.max(14, baselineVitals.respRate - (projectedMap >= 65 ? 4 : 0)),
    temperatureC: interventions.antibioticsActive
      ? Number(Math.max(37.1, baselineVitals.temperatureC - 0.7).toFixed(1))
      : baselineVitals.temperatureC,
    cvp: projectedCvp,
    etco2: Math.min(40, baselineVitals.etco2 + (projectedCo > baselineVitals.cardiacOutput ? 3 : 0)),
    cardiacOutput: projectedCo,
    svr: projectedSvr,
    urineOutputPerHour: projectedUrine,
  };

  const projectedLabs: LabPanel = {
    ...baselineLabs,
    lactate: projectedLactate,
    pao2: projectedPao2,
    fio2: currentFio2,
    ph: projectedPh,
    baseExcess: projectedBe,
    creatinine: Number(
      Math.max(0.8, baselineLabs.creatinine - (projectedUrine > 40 ? 0.2 : 0)).toFixed(2)
    ),
  };

  const predictedScores = computeAllScores(
    projectedVitals,
    projectedLabs,
    { norepinephrine: norepiDose, dobutamine: dobutamineDose },
    projectedMap < 60
  );

  const baselineScores = computeAllScores(
    baselineVitals,
    baselineLabs,
    { norepinephrine: 0, dobutamine: 0 },
    baselineVitals.map < 60
  );

  // Clinical Insights formulation
  const insights: string[] = [];
  if (projectedMap >= 65) {
    insights.push(`Target MAP (>= 65 mmHg) achieved (+${projectedMap - baselineVitals.map} mmHg net gain).`);
  } else {
    insights.push(`WARNING: Under-resuscitation. Projected MAP ${projectedMap} mmHg fails 65 mmHg organ perfusion threshold.`);
  }

  if (interventions.antibioticsActive) {
    insights.push(`Broad-spectrum antimicrobials active: Halts septic endotoxemia and triggers bactericidal clearance.`);
  } else {
    insights.push(`CRITICAL OMISSION: Empiric antibiotics not selected. Surviving Sepsis guidelines mandate administration within 1 hour.`);
  }

  if (fluidOverloadRisk === 'high') {
    insights.push(`FLUID OVERLOAD ALERT: Total bolus exceeds vascular capacitance. CVP ${projectedCvp} mmHg increases pulmonary extravasation risk.`);
  } else if (interventions.crystalloidBolusMl > 0) {
    insights.push(`Crystalloid bolus (${interventions.crystalloidBolusMl} mL) restored effective circulating volume.`);
  }

  if (norepiDose > 0.25 && !interventions.vasopressinUnitsMin) {
    insights.push(`Recommendation: Add Vasopressin 0.03 U/min to reduce high-dose Norepinephrine adrenergic burden.`);
  }

  return {
    timeHorizonHours,
    predictedVitals: projectedVitals,
    predictedScores,
    predictedLabs: projectedLabs,
    deltaMap: projectedMap - baselineVitals.map,
    deltaLactate: Number((projectedLactate - baselineLabs.lactate).toFixed(2)),
    deltaRiskScore: predictedScores.sepsisRiskScore - baselineScores.sepsisRiskScore,
    fluidOverloadRisk,
    pulmonaryEdemaProbability: pulmonaryEdemaProb,
    clinicalInsights: insights,
    sscGuidelineAdherence: {
      bloodCulturesOrdered: true,
      antibioticsWithin1Hour: interventions.antibioticsActive,
      fluidBolusCompleted: interventions.crystalloidBolusMl >= recommendedFluidMl,
      vasopressorForMapTarget: projectedMap >= 65,
      lactateRemeasurementScheduled: true,
    },
  };
}

/**
 * Derives real-time 3D Organ Digital Twin Perfusion and Stress Status
 */
export function deriveOrganTwinStatuses(
  vitals: TelemetryVitals,
  labs: LabPanel,
  sofaSubscores: SOFASubscores
): OrganTwinStatus[] {
  // 1. Brain / Neuro
  const brainPerfusion = Math.min(100, Math.max(15, Math.round((vitals.map / 70) * 85)));
  const brainStress =
    sofaSubscores.cns >= 3 || vitals.map < 55
      ? 'critical'
      : sofaSubscores.cns >= 2 || vitals.map < 65
      ? 'failing'
      : sofaSubscores.cns >= 1
      ? 'compensated'
      : 'normal';

  // 2. Heart / Cardiovascular
  const heartPerfusion = Math.min(100, Math.max(20, Math.round((vitals.cardiacOutput / 6.0) * 80)));
  const heartStress =
    sofaSubscores.cardiovascular >= 3
      ? 'critical'
      : sofaSubscores.cardiovascular >= 2
      ? 'failing'
      : vitals.heartRate > 110 || vitals.map < 65
      ? 'compensated'
      : 'normal';

  // 3. Lungs / Pulmonary
  const pfRatio = labs.fio2 > 0 ? labs.pao2 / labs.fio2 : 400;
  const lungPerfusion = Math.min(100, Math.max(15, Math.round((vitals.spo2 / 100) * (pfRatio / 400) * 100)));
  const lungStress =
    sofaSubscores.respiration >= 3 || vitals.spo2 < 88
      ? 'critical'
      : sofaSubscores.respiration >= 2 || vitals.spo2 < 93
      ? 'failing'
      : sofaSubscores.respiration >= 1 || vitals.respRate > 22
      ? 'compensated'
      : 'normal';

  // 4. Kidneys / Renal
  const renalPerfusion = Math.min(
    100,
    Math.max(10, Math.round((vitals.urineOutputPerHour / 50) * 60 + (vitals.map >= 65 ? 30 : 5)))
  );
  const renalStress =
    sofaSubscores.renal >= 3 || vitals.urineOutputPerHour < 15
      ? 'critical'
      : sofaSubscores.renal >= 2 || vitals.urineOutputPerHour < 30
      ? 'failing'
      : sofaSubscores.renal >= 1
      ? 'compensated'
      : 'normal';

  // 5. Liver / Hepatic
  const liverPerfusion = Math.min(100, Math.max(25, Math.round((1.2 / Math.max(0.5, labs.bilirubin)) * 80)));
  const liverStress =
    sofaSubscores.liver >= 3
      ? 'critical'
      : sofaSubscores.liver >= 2
      ? 'failing'
      : sofaSubscores.liver >= 1
      ? 'compensated'
      : 'normal';

  // 6. Microvascular / Endothelium
  const vascularPerfusion = Math.min(
    100,
    Math.max(15, Math.round((vitals.map / 75) * 60 + (2.0 / Math.max(0.8, labs.lactate)) * 35))
  );
  const vascularStress =
    labs.lactate >= 4.0 || vitals.svr < 600
      ? 'critical'
      : labs.lactate >= 2.5 || vitals.svr < 800
      ? 'failing'
      : labs.lactate > 2.0
      ? 'compensated'
      : 'normal';

  return [
    {
      id: 'brain',
      name: 'Cerebral Microcirculation',
      perfusionIndex: brainPerfusion,
      stressLevel: brainStress,
      sofaScore: sofaSubscores.cns,
      clinicalNotes:
        brainStress === 'critical'
          ? 'Severe septic encephalopathy with global hypoperfusion.'
          : brainStress === 'failing'
          ? 'Fluctuating mentation, delirium risk secondary to reduced MAP.'
          : 'Preserved autoregulation; alert and responsive.',
      biomarkers: [
        { label: 'MAP', value: `${vitals.map}`, unit: 'mmHg', alert: vitals.map < 65 },
        { label: 'SOFA CNS', value: `${sofaSubscores.cns}`, unit: 'pts', alert: sofaSubscores.cns > 1 },
      ],
    },
    {
      id: 'heart',
      name: 'Myocardial & Hemodynamics',
      perfusionIndex: heartPerfusion,
      stressLevel: heartStress,
      sofaScore: sofaSubscores.cardiovascular,
      clinicalNotes:
        heartStress === 'critical'
          ? 'Septic cardiomyopathy; vasopressor refractory hypotension.'
          : heartStress === 'failing'
          ? 'Vasopressor dependency with compensatory sinus tachycardia.'
          : 'Hyperdynamic septic state with elevated cardiac output.',
      biomarkers: [
        { label: 'Cardiac Output', value: `${vitals.cardiacOutput}`, unit: 'L/min' },
        { label: 'HR', value: `${vitals.heartRate}`, unit: 'bpm', alert: vitals.heartRate > 105 },
        { label: 'CVP', value: `${vitals.cvp}`, unit: 'mmHg' },
      ],
    },
    {
      id: 'lungs',
      name: 'Pulmonary Capillary Bed',
      perfusionIndex: lungPerfusion,
      stressLevel: lungStress,
      sofaScore: sofaSubscores.respiration,
      clinicalNotes:
        lungStress === 'critical'
          ? 'Severe ARDS with alveolar exudative flooding and severe V/Q mismatch.'
          : lungStress === 'failing'
          ? 'Moderate acute lung injury with tachypneic compensatory work.'
          : 'Acceptable gas exchange under current FiO2.',
      biomarkers: [
        { label: 'PaO2/FiO2', value: `${Math.round(pfRatio)}`, unit: 'ratio', alert: pfRatio < 300 },
        { label: 'SpO2', value: `${vitals.spo2}`, unit: '%', alert: vitals.spo2 < 92 },
        { label: 'RR', value: `${vitals.respRate}`, unit: '/min', alert: vitals.respRate > 22 },
      ],
    },
    {
      id: 'kidneys',
      name: 'Renal Glomerular Filtration',
      perfusionIndex: renalPerfusion,
      stressLevel: renalStress,
      sofaScore: sofaSubscores.renal,
      clinicalNotes:
        renalStress === 'critical'
          ? 'Oliguric Acute Kidney Injury (KDIGO Stage 3) with acute tubular injury.'
          : renalStress === 'failing'
          ? 'Pre-renal azotemia with sluggish urine output.'
          : 'Euvolemic renal perfusion maintaining brisk filtration.',
      biomarkers: [
        { label: 'Creatinine', value: `${labs.creatinine}`, unit: 'mg/dL', alert: labs.creatinine > 1.3 },
        { label: 'Urine Output', value: `${vitals.urineOutputPerHour}`, unit: 'mL/hr', alert: vitals.urineOutputPerHour < 30 },
      ],
    },
    {
      id: 'liver',
      name: 'Hepatic Splanchnic Bed',
      perfusionIndex: liverPerfusion,
      stressLevel: liverStress,
      sofaScore: sofaSubscores.liver,
      clinicalNotes:
        liverStress === 'critical'
          ? 'Ischemic hepatitis and septic cholestasis.'
          : liverStress === 'failing'
          ? 'Early bilirubin rise with impaired drug clearance.'
          : 'Hepatic metabolic clearance intact.',
      biomarkers: [
        { label: 'Bilirubin', value: `${labs.bilirubin}`, unit: 'mg/dL', alert: labs.bilirubin > 1.2 },
        { label: 'INR', value: `${labs.inr}`, unit: 'ratio' },
      ],
    },
    {
      id: 'vascular',
      name: 'Endothelial Microvasculature',
      perfusionIndex: vascularPerfusion,
      stressLevel: vascularStress,
      sofaScore: labs.lactate >= 4 ? 4 : labs.lactate >= 2 ? 2 : 0,
      clinicalNotes:
        vascularStress === 'critical'
          ? 'Profound endothelial glycocalyx degradation and systemic vasodilatory collapse.'
          : vascularStress === 'failing'
          ? 'Mottled capillary refill with progressive hyperlactatemia.'
          : 'Microvascular perfusion preserved.',
      biomarkers: [
        { label: 'Lactate', value: `${labs.lactate}`, unit: 'mmol/L', alert: labs.lactate >= 2.0 },
        { label: 'SVR', value: `${vitals.svr}`, unit: 'dyn·s·cm⁻⁵', alert: vitals.svr < 800 },
        { label: 'Procalcitonin', value: `${labs.procalcitonin}`, unit: 'ng/mL', alert: labs.procalcitonin > 0.5 },
      ],
    },
  ];
}
