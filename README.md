# Twin-PULSE [Tean rPLEX]

### Predict ahead. Simulate first. Support informed care.

A predictive Clinical Digital Twin prototype that explores 30-minute-ahead patient deterioration forecasting and allows clinicians to compare simulated “What-If” intervention scenarios.

> **Prototype notice:** Twin-PULSE currently uses synthetic clinical data and a mock/simulation ML environment. The 30-minute horizon is a prototype forecasting target, not a clinically validated warning capability. Its probability scores, uncertainty displays, and intervention trajectories are experimental outputs—not validated clinical predictions or treatment recommendations. Do not use this system for diagnosis, treatment, emergency monitoring, or decisions about real patients.

## 1. Project Overview

# Twin-PULSE
### Clinical Intelligence, Visualized

**Twin-PULSE ** is a futuristic ICU telemetry and clinical digital-twin prototype designed to make complex patient physiology easier to explore through an interactive, visual command center.

Built with **React, TypeScript, and Vite**, the platform integrates live-style telemetry displays, laboratory indicators, sepsis-risk assessments, 3D organ visualizations, and a **What-If Treatment Simulator**. Its modular interface brings patient monitoring and clinical scenario exploration into one cohesive experience.

At its core, a clinical calculation engine computes qSOFA, SOFA, NEWS2, shock index, derived sepsis-risk scores, and simulated intervention outcomes. Users can explore synthetic patient profiles, trigger clinical scenarios, adjust simulated treatments, and observe projected physiological changes across vital signs and organ-status indicators.

The backend uses **Node.js, Express, TypeScript, and Google Gemini integration**. Dedicated API endpoints support AI-assisted sepsis analysis, counterfactual treatment critique, and SBAR clinical handover generation. When AI generation is unavailable or its response cannot be parsed, fallback logic provides an alternative response path.

The project's key innovation is its combination of **clinical calculations, interactive visualization, organ-level digital-twin concepts, and AI-generated clinical summaries** in one demonstration platform. It offers a compelling foundation for exploring how complex ICU information could be presented to support clinician-led assessment and decision-making.

**Current scope:** This is a proof-of-concept using synthetic patient data and in-memory application state. It is not a clinically validated medical device. Production deployment would require clinical validation, secure authentication, privacy controls, persistent storage, audit trails, and rigorous testing.

**Twin-PULSE  — transforming complex clinical signals into an interactive picture of patient status.**


- **Project title:** : Twin-PULSE
- **Team:**          : rPLEX
- **Institution:**   : Kamla Nehru Institute Of Technology, 
                       Sultanpur
- **Repository:**    https://github.com/amssre15956-cmd/Plus-Twin-Clinical_medico


## 2. Team Details

|     Member    |     Role    |        Contribution        |

| Hitesh Sharma | Team Leader | Backend development and    | core                          |    core idea developer     |
| Yash Dixit    | Team Member | AI-powered frontend design |

## 3. College / Incubator Information
 
- **College / Institution:** :   Kamla Nehru Institute Of       
                                 Technology, Sultanpur


## 4. Problem Statement

The project addresses the “Wait-and-React” pattern in critical-care monitoring: threshold-based alarms can alert clinicians when a monitored value has already crossed a danger threshold, such as low oxygen saturation. The team aims to explore earlier warning and scenario comparison rather than relying only on threshold-triggered responses.

Alarm fatigue, clinician workload, and delays in responding to deterioration motivate the design. Reduction in these problems has not yet been demonstrated by this prototype.

## 5. Healthcare Use Case

### Intended Users

- ICU physicians
- Ward doctors
- Respiratory therapists
- Critical care nurses
- Hospital administrators

### Demonstration Workflow

1. Generate synthetic patient records and sensor trajectories.
2. Display simulated SpO2 and HRV telemetry in the monitoring console.
3. Estimate hypoxemia risk over a target 30-minute forecasting horizon.
4. Inspect probability scores, uncertainty displays, and evaluation views.
5. Select a modeled intervention, such as oxygen administration, in the What-If sandbox.
6. Compare the baseline projected SpO2 trajectory with the simulated intervention trajectory.

This workflow demonstrates a possible future decision-support interface. It is not approved or validated for clinical use.

## 6. Implemented Prototype Features

The following features are reported by the project team:

- **Predictive hypoxemia forecasting:** Prototype risk estimation targeting a 30-minute horizon using synthetic data.
- **What-If intervention sandbox:** Software-only comparison of modeled intervention scenarios.
- **Telemetry monitoring:** Real-time-style visualization of generated SpO2 and HRV trajectories.
- **Clinician-focused interface:** Custom glassmorphism interface designed for low cognitive load; usability and burnout benefits have not been clinically evaluated.
- **ML evaluation views:** Displays for ROC-AUC, Brier scores, and confusion matrices. No numerical benchmark results are claimed in this README.
- **Trajectory and uncertainty visualization:** Displays projected SpO2 paths and experimental uncertainty intervals; coverage and clinical reliability are not established.

## 7. Technical Stack

| Layer | Technology / Approach |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript; custom glassmorphism UI; no frontend framework |
| Backend | Python, FastAPI |
| ASGI server | Uvicorn |
| Machine learning | scikit-learn: RandomForestClassifier and CalibratedClassifierCV |
| Calibration | Isotonic / sigmoid calibration, depending on implementation configuration |
| Data processing | pandas, NumPy |
| Validation / schemas | Pydantic |
| Storage | In-memory Python dictionaries and lists; no persistent database |
| API integration | Local FastAPI endpoints for monitoring status and alert actions |
| Deployment | Localhost |

## 8. AI / ML Model and Framework Details

### Prediction Task

Estimate the probability of hypoxemia over a target 30-minute future window from synthetic patient information and generated telemetry.

### Model Components

- **Base classifier:** scikit-learn RandomForestClassifier.
- **Calibration component:** CalibratedClassifierCV using isotonic or sigmoid calibration as configured in the implementation.
- **Data environment:** Synthetic clinical records and a mock/simulation ML workflow.

The exact active model configuration, feature definitions, training split, label construction, calibration setup, and package versions are not documented here. Consult the implementation before reproducing or interpreting results.

### Data Sources

- Synthetic FHIR bundles representing patient record information.
- Generated sensor trajectories mimicking SpO2 and HRV behavior.
- No real-patient clinical validation is reported.

Synthetic data does not establish performance on real patients or in a deployed healthcare setting.

### Evaluation

The console includes ROC-AUC, Brier score, and confusion-matrix views. Numeric results, sample sizes, holdout methodology, calibration assessment, and uncertainty-interval coverage have not been supplied for this submission README. Displaying these metrics alone does not establish generalization or clinical readiness.

### Intervention Simulation

The sandbox models projected SpO2 responses to selected interventions. These projections are illustrative simulations, not verified causal treatment-effect estimates. They must not be interpreted as dosage guidance or evidence that an intervention will improve an actual patient's condition.

## 9. Architecture

Conceptual flow based on the project description:

```text
Synthetic FHIR bundles + generated SpO2 / HRV trajectories
                            |
                            v
                 Python / FastAPI backend
                 + in-memory state stores
                            |
              +-------------+-------------+
              |                           |
              v                           v
      Risk-estimation workflow    What-If simulation logic
      Random Forest + calibration Projected SpO2 trajectories
              |                           |
              +-------------+-------------+
                            |
                            v
                  Local FastAPI endpoints
                            |
                            v
                  HTML / CSS / JavaScript
                  Clinical Digital Twin console
```

**Required PDF architecture artifact:** 

The team reports an architecture document which is available in the [](https://drive.google.com/file/d/1ltoRG30JOPPUVoKyUofm8stXvCkjqZwv/view?usp=drive_link). 


## 10. Installation and Local Setup

### Prerequisites

- Python and pip
- Git
- A modern web browser

Exact supported package and Python versions have not yet been specified.

### Clone the Repository

```bash
git clone https://github.com/amssre15956-cmd/PlusTWIN.git
cd PlusTWIN
```

### Install Backend Dependencies

```bash
pip install fastapi uvicorn scikit-learn pandas numpy pydantic
```

### Start the Backend

From the directory containing `main.py`, run:

```bash
uvicorn main:app --reload
```

With the default Uvicorn configuration, the expected local backend address is `http://127.0.0.1:8000`. Use the address printed in your terminal if the configuration differs.

### Open the Frontend

Open `index.html` in a modern web browser, or serve the frontend directory using a local development server.

The frontend must point to the running backend. Repository-specific file paths, API configuration, and browser-origin permissions should be checked against the code. These setup instructions were supplied by the team and have not been independently execution-tested.

## 11. Demo Video

- **Duration:** 15–20 minutes.
- **Required visibility:** Unlisted on YouTube.
- **Video link:** [](https://www.youtube.com/watch?v=qon0Npceobc)


## 12. Project Presentation

- **Presentation link:** [] (https://docs.google.com/presentation/d/1ms6ZGbMqA9hltYDjJo5tgkUXCKqh2tG1/edit?usp=drive_link&ouid=110870751803225951327&rtpof=true&sd=true)

The presentation covers the problem, healthcare use case, solution, architecture, stack, AI/ML approach, implemented features, outcomes, limitations, and future work.

## 13. Results and Outcomes

### Team-Reported Implementation Outcomes

- Implemented a real-time-style predictive dashboard using generated patient telemetry.
- Generated calibrated hypoxemia probability scores in the prototype workflow.
- Visualized uncertainty intervals and projected SpO2 trajectories.
- Added modeled intervention scenarios and ML evaluation views.

### Evidence Boundaries

No numerical performance results, real-patient evaluation, prospective study, external validation, or clinical outcome improvements are claimed. The forecasting horizon is a design target, not proof of a 30-minute clinical warning capability. Calibration and uncertainty displays require further validation.

## 14. Known Limitations and Safety

- Uses synthetic clinical data and a mock/simulation ML environment.
- No established real-world predictive performance or clinical benefit.
- No persistent database; application state may be lost when the backend stops or restarts.
- Localhost deployment only; production readiness has not been established.
- Modeled intervention effects are not validated physiological or causal treatment models.
- No demonstrated reduction in alarm fatigue, cognitive load, or clinician burnout.
- Not a medical device; not for diagnosis, treatment, or emergency monitoring.
- Real patient data should not be introduced without appropriate authorization, privacy safeguards, security review, and institutional oversight.

## 15. Future Work

The following are proposed next steps, not completed features:

- Document reproducible training, labeling, calibration, and evaluation procedures.
- Evaluate on appropriately authorized clinical datasets and external cohorts.
- Validate intervention simulations and uncertainty estimates.
- Add persistent storage, authentication, access control, and audit logging.
- Conduct clinician usability studies and assess alarm burden.
- Pursue appropriate clinical, security, and regulatory review before considering real-world deployment.

## 16. Open-Source License

The proposed license for the team's original project code is the **MIT License**. See [LICENSE](LICENSE).

MIT permits reuse, modification, distribution, and commercial use subject to preservation of its copyright and license notice. It does not require downstream projects to be open source. The software is provided without warranty.

Before publishing, the contributors must confirm that they have the rights to license their contributions and that this choice is consistent with applicable institutional, event, and third-party terms. Third-party libraries, data, assets, and other materials retain their own licenses. MIT is not a guarantee against future legal or licensing conflicts and does not authorize clinical deployment.

## 17. Submission Checklist

-  Team details included.
-  College / incubator information included.
-  Project title included.
-  Problem statement included.
-  Healthcare use case included.
-  Technical stack included.
-  AI/ML model and framework details included, with evidence limitations.
-  15–20 minute Unlisted YouTube demo uploaded and linked.
-  MIT license approved by contributors and LICENSE file added to the repository.
-  Direct, accessible architecture diagram link added in PDF/PPT format.
- [Repository, files, and all links tested while signed out and confirmed accessible without additional permissions.
