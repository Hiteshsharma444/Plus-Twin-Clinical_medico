import React, { useState } from 'react';

const CLINICAL_PLANS = [
  {
    tier: 'Community ICU',
    priceMonthly: 'Pilot Free',
    priceYearly: 'Pilot Free',
    desc: 'For community hospitals and regional units evaluating digital twin telemetry.',
    features: [
      'Up to 8 bedside telemetry streams',
      'Real-time arterial wave oscilloscope',
      'Sepsis-3 & SOFA baseline scoring',
      'Standard Surviving Sepsis protocols',
      'Secure browser-based bedside HUD',
    ],
    isPro: false,
  },
  {
    tier: 'Academic Medical',
    priceMonthly: '$9,99/bed/m',
    priceYearly: '$99,99/bed/y',
    desc: 'For tertiary critical care centers requiring multiorgan 3D biophysical twins.',
    features: [
      'Up to 64 ICU beds concurrently',
      '3D Holographic Cardiopulmonary Twin HUD',
      'Gemini SBAR & Handover AI Scribe',
      'Real-time What-If Counterfactual Simulator',
      'Epic / Cerner HL7 & FHIR bidirectional sync',
    ],
    isPro: false,
  },
  {
    tier: 'Health System Pro',
    priceMonthly: '$19,99/bed/m',
    priceYearly: '$199,99/bed/y',
    desc: 'For multi-hospital health systems deploying centralized ICU command centers.',
    features: [
      'Unlimited hospital beds and regional nodes',
      'High-frequency 100Hz arterial line streaming',
      'Federated digital twin model calibration',
      'Multicenter clinical trial telemetry export',
      '24/7 Dedicated Clinical Engineering Support',
    ],
    isPro: true,
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="c3-pricing-section" id="pricing">
      {/* Dedicated Pricing SVG Filter */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={2} stitchTiles="stitch" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={0.075} />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      {/* Editorial Watermark */}
      <div className="c3-watermark-container select-none pointer-events-none">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Twin-PULSE</span>
          <span className="c3-watermark-line-2">Revitalized</span>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="c3-toggle-wrap">
        <span style={{ fontSize: '0.88rem', color: yearly ? 'rgba(255,255,255,0.45)' : '#fff' }}>
          Monthly Per-Bed
        </span>
        <button
          type="button"
          onClick={() => setYearly(!yearly)}
          className={`c3-toggle ${yearly ? 'active' : ''}`}
          aria-label="Toggle Monthly or Annual Licensing"
        >
          <div className="c3-toggle-knob" />
        </button>
        <span style={{ fontSize: '0.88rem', color: yearly ? '#fff' : 'rgba(255,255,255,0.45)' }}>
          Annual Institutional <span style={{ color: '#00d2ff', fontSize: '0.8rem' }}>(Save 20%)</span>
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="c3-grid">
        {CLINICAL_PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`c3-card ${plan.isPro ? 'c3-card-pro' : ''}`}
          >
            <div className="c3-tier-small">{plan.tier}</div>
            <div className="c3-tier-large font-mono">
              {yearly ? plan.priceYearly : plan.priceMonthly}
            </div>
            <div className="c3-desc">{plan.desc}</div>

            <ul className="c3-list list-none p-0 m-0">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <div className="c3-check">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="c3-btn">
              Select Deployment
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
