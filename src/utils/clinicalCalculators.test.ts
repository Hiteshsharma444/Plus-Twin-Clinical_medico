import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQSOFA,
  calculateSOFA,
  calculateNEWS2,
  calculateShockIndex,
  calculateSepsisRiskScore,
  simulateInterventions,
} from './clinicalCalculators.ts';

test('qSOFA correctly calculates positive score for sepsis screening', () => {
  // SBP 85 (<= 100) -> 1 pt
  // RR 26 (>= 22) -> 1 pt
  // Altered mental state -> 1 pt
  const result = calculateQSOFA(85, 26, true);
  assert.equal(result.score, 3);
  assert.equal(result.criteria.systolicBPThreshold, true);
  assert.equal(result.criteria.highRespRate, true);
  assert.equal(result.criteria.alteredMentalState, true);

  // Normal patient
  const normal = calculateQSOFA(120, 16, false);
  assert.equal(normal.score, 0);
});

test('calculateSOFA correctly tallies multi-organ subscores', () => {
  const vitals = { map: 58, urineOutputPerHour: 15 };
  const labs = {
    pao2: 65,
    fio2: 0.5, // P/F ratio = 130 (< 200) -> 3 pts
    platelets: 85, // < 100 -> 2 pts
    bilirubin: 2.4, // >= 2.0 -> 2 pts
    creatinine: 2.2, // >= 2.0 -> 2 pts
  };
  const vasopressors = { norepinephrine: 0.15, dobutamine: 0 }; // norepi > 0.1 -> 4 pts
  const gcs = 11; // GCS 10-12 -> 2 pts

  const sofa = calculateSOFA(vitals, labs, vasopressors, gcs);
  // Respiration: 3, Coagulation: 2, Liver: 2, Cardio: 4, CNS: 2, Renal: 2
  assert.equal(sofa.subscores.respiration, 3);
  assert.equal(sofa.subscores.coagulation, 2);
  assert.equal(sofa.subscores.liver, 2);
  assert.equal(sofa.subscores.cardiovascular, 4);
  assert.equal(sofa.subscores.cns, 2);
  assert.equal(sofa.subscores.renal, 3); // UO < 20 mL/hr gives 3 points
  assert.equal(sofa.total, 16);
});

test('Shock Index calculation indicates occult shock when > 0.9', () => {
  const normalSI = calculateShockIndex(75, 120);
  assert.equal(normalSI, 0.63);

  const shockSI = calculateShockIndex(118, 84);
  assert.equal(shockSI, 1.4);
  assert.equal(shockSI > 0.9, true);
});

test('NEWS2 score assigns proper points for ICU vital signs', () => {
  const severeVitals = {
    respRate: 28, // +3
    spo2: 89, // +3
    temperatureC: 39.4, // +2
    systolicBP: 85, // +3
    heartRate: 125, // +2
  };
  const news2 = calculateNEWS2(severeVitals, true, true); // +2 (O2) + 3 (consciousness)
  assert.equal(news2 >= 15, true);
});

test('Sepsis Risk Score categories are properly stratified', () => {
  const criticalVitals = {
    heartRate: 124,
    systolicBP: 80,
    diastolicBP: 48,
    map: 58,
    spo2: 89,
    respRate: 28,
    temperatureC: 39.2,
    cvp: 4,
    etco2: 24,
    cardiacOutput: 4.8,
    svr: 550,
    urineOutputPerHour: 12,
  };
  const criticalLabs = {
    lactate: 4.6,
    wbc: 18.2,
    procalcitonin: 4.8,
    creatinine: 2.8,
    platelets: 75,
    bilirubin: 2.1,
    pao2: 60,
    fio2: 0.6,
    baseExcess: -7.5,
    ph: 7.24,
    inr: 1.6,
  };

  const criticalRisk = calculateSepsisRiskScore(criticalVitals, criticalLabs, 12, 1.55);
  assert.equal(criticalRisk.category, 'critical');
  assert.equal(criticalRisk.score >= 75, true);
});

test('simulateInterventions produces physiological recovery with fluid & vasopressor', () => {
  const baselineVitals = {
    heartRate: 118,
    systolicBP: 82,
    diastolicBP: 50,
    map: 60,
    spo2: 92,
    respRate: 24,
    temperatureC: 38.8,
    cvp: 5,
    etco2: 28,
    cardiacOutput: 5.5,
    svr: 620,
    urineOutputPerHour: 18,
  };
  const baselineLabs = {
    lactate: 3.8,
    wbc: 16.5,
    procalcitonin: 3.2,
    creatinine: 1.9,
    platelets: 110,
    bilirubin: 1.5,
    pao2: 70,
    fio2: 0.35,
    baseExcess: -5.0,
    ph: 7.29,
    inr: 1.3,
  };
  const interventions = {
    crystalloidBolusMl: 2000,
    norepinephrineMcgKgMin: 0.15,
    vasopressinUnitsMin: 0.03,
    dobutamineMcgKgMin: 0,
    antibioticsActive: true,
    o2DeliveryType: 'High Flow Nasal Cannula' as const,
    fio2Percent: 50,
    peepCmH2O: 8,
    hydrocortisoneActive: false,
  };

  const outcome = simulateInterventions(baselineVitals, baselineLabs, interventions, { weightKg: 70 }, 4);

  // MAP should rise toward and exceed target 65 mmHg
  assert.equal(outcome.predictedVitals.map >= 65, true);
  assert.equal(outcome.deltaMap > 0, true);
  // Lactate should clear with antibiotic and perfusion restoration
  assert.equal(outcome.deltaLactate < 0, true);
  // Risk score should decline
  assert.equal(outcome.deltaRiskScore < 0, true);
  // Guidelines satisfied
  assert.equal(outcome.sscGuidelineAdherence.antibioticsWithin1Hour, true);
  assert.equal(outcome.sscGuidelineAdherence.vasopressorForMapTarget, true);
});
