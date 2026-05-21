import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const hospitals = ['H1', 'H2', 'H3', 'H4'];
const residents = ['R1', 'R2', 'R3', 'R4'];

const hospitalPreferences = {
  H1: ['R1', 'R2', 'R3', 'R4'],
  H2: ['R1', 'R2', 'R3', 'R4'],
  H3: ['R1', 'R2', 'R3', 'R4'],
  H4: ['R2', 'R3', 'R4', 'R1'],
};

const residentPreferences = {
  R1: ['H3', 'H2', 'H1', 'H4'],
  R2: ['H4', 'H2', 'H1', 'H3'],
  R3: ['H2', 'H1', 'H4', 'H3'],
  R4: ['H1', 'H4', 'H3', 'H2'],
};

const steps = [
  {
    title: 'Start with everyone unmatched',
    text: 'Always choose the lowest-ID unmatched hospital, and have it propose down its preference list until it is matched.',
    proposals: [],
    matches: {},
    activeHospital: null,
  },
  {
    title: 'H1 proposes to R1',
    text: 'R1 is unmatched, so R1 holds H1 for now. This first match is only tentative.',
    proposals: [['H1', 'R1']],
    matches: {R1: 'H1'},
    activeHospital: 'H1',
  },
  {
    title: 'H2 proposes to R1',
    text: 'R1 prefers H2 over H1, so R1 trades up to H2. H1 becomes unmatched again.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
    ],
    matches: {R1: 'H2'},
    activeHospital: 'H2',
    rejected: ['H1', 'R1'],
  },
  {
    title: 'H1 proposes to R2',
    text: 'H1 was displaced, so it moves to the next resident on its list. R2 is free and holds H1.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
    ],
    matches: {R1: 'H2', R2: 'H1'},
    activeHospital: 'H1',
  },
  {
    title: 'H3 proposes to R1',
    text: 'R1 prefers H3 over H2, so R1 trades up again. Now H2 is displaced.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
    ],
    matches: {R1: 'H3', R2: 'H1'},
    activeHospital: 'H3',
    rejected: ['H2', 'R1'],
  },
  {
    title: 'H2 proposes to R2',
    text: 'R2 prefers H2 over H1, so R2 trades up. H1 is displaced for the second time.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
      ['H2', 'R2'],
    ],
    matches: {R1: 'H3', R2: 'H2'},
    activeHospital: 'H2',
    rejected: ['H1', 'R2'],
  },
  {
    title: 'H1 proposes to R3',
    text: 'H1 continues down its list and lands with free R3.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H1', 'R3'],
    ],
    matches: {R1: 'H3', R2: 'H2', R3: 'H1'},
    activeHospital: 'H1',
  },
  {
    title: 'H4 proposes to R2',
    text: 'R2 prefers H4 over H2, so R2 trades up. H2 becomes unmatched again.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H1', 'R3'],
      ['H4', 'R2'],
    ],
    matches: {R1: 'H3', R2: 'H4', R3: 'H1'},
    activeHospital: 'H4',
    rejected: ['H2', 'R2'],
  },
  {
    title: 'H2 proposes to R3',
    text: 'R3 prefers H2 over H1, so R3 trades up. H1 gets displaced yet again.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H1', 'R3'],
      ['H4', 'R2'],
      ['H2', 'R3'],
    ],
    matches: {R1: 'H3', R2: 'H4', R3: 'H2'},
    activeHospital: 'H2',
    rejected: ['H1', 'R3'],
  },
  {
    title: 'H1 proposes to R4',
    text: 'R4 is unmatched, so R4 holds H1. Every hospital is now matched and the algorithm terminates.',
    proposals: [
      ['H1', 'R1'],
      ['H2', 'R1'],
      ['H1', 'R2'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H1', 'R3'],
      ['H4', 'R2'],
      ['H2', 'R3'],
      ['H1', 'R4'],
    ],
    matches: {R1: 'H3', R2: 'H4', R3: 'H2', R4: 'H1'},
    activeHospital: 'H1',
  },
];

function rank(preferences, option) {
  return preferences.indexOf(option) + 1;
}

function RankingTrail({label, options, getPairKey, getPairClass}) {
  return (
    <div className={styles.rankingTrail} aria-label={label}>
      <small className={styles.trailLabel}>Ranking</small>
      <div className={styles.rankingList}>
        {options.map((option, index) => (
          <React.Fragment key={getPairKey(option)}>
            {index > 0 && <span className={styles.rankingSeparator}>&gt;</span>}
            <span className={clsx(styles.rankingChip, getPairClass(option))}>
              {option}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function MatchingBoard({step}) {
  const matchedHospitals = useMemo(
    () => new Set(Object.values(step.matches)),
    [step.matches],
  );
  const matchesByHospital = useMemo(
    () =>
      Object.entries(step.matches).reduce((groups, [resident, hospital]) => {
        groups[hospital] = resident;
        return groups;
      }, {}),
    [step.matches],
  );
  const proposalKeys = useMemo(
    () =>
      new Set(step.proposals.map(([hospital, resident]) => `${hospital}-${resident}`)),
    [step.proposals],
  );
  const latestProposal = step.proposals[step.proposals.length - 1];
  const latestKey = latestProposal ? `${latestProposal[0]}-${latestProposal[1]}` : null;

  const getPairClass = (hospital, resident) => {
    const key = `${hospital}-${resident}`;
    const wasProposed = proposalKeys.has(key);
    const currentMatch = step.matches[resident];
    const isHeld = currentMatch === hospital;
    const wasRejected =
      wasProposed &&
      !isHeld &&
      currentMatch &&
      rank(residentPreferences[resident], currentMatch) <
        rank(residentPreferences[resident], hospital);

    return [
      wasProposed && styles.proposedPair,
      latestKey === key && styles.latestPair,
      isHeld && styles.acceptedPair,
      wasRejected && styles.rejectedPair,
    ];
  };

  return (
    <section className={styles.board} aria-label="Stable matching proposal board">
      <div className={styles.boardColumn}>
        <h3>Hospitals</h3>
        {hospitals.map((hospital) => {
          const match = matchesByHospital[hospital];
          return (
            <div
              className={clsx(
                styles.person,
                step.activeHospital === hospital && styles.activePerson,
                matchedHospitals.has(hospital) && styles.matchedPerson,
              )}
              key={hospital}>
              <div className={styles.personHeader}>
                <span>{hospital}</span>
                <small>{match ? `matched with ${match}` : 'free'}</small>
              </div>
              <RankingTrail
                label={`${hospital} ranking`}
                options={hospitalPreferences[hospital]}
                getPairKey={(resident) => `${hospital}-${resident}`}
                getPairClass={(resident) => getPairClass(hospital, resident)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.boardColumn}>
        <h3>Residents</h3>
        {residents.map((resident) => {
          const match = step.matches[resident];
          return (
            <div
              className={clsx(styles.person, match && styles.matchedPerson)}
              key={resident}>
              <div className={styles.personHeader}>
                <span>{resident}</span>
                <small>{match ? `matched with ${match}` : 'free'}</small>
              </div>
              <RankingTrail
                label={`${resident} ranking`}
                options={residentPreferences[resident]}
                getPairKey={(hospital) => `${hospital}-${resident}`}
                getPairClass={(hospital) => getPairClass(hospital, resident)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function StableMatchingFramework() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const goForward = () =>
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  const reset = () => setStepIndex(0);

  return (
    <div className={styles.framework}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Gale-Shapley Framework</p>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.stepBadge}>
            Step {stepIndex + 1} / {steps.length}
          </div>
          <div className={styles.controls}>
            <button type="button" onClick={goBack} disabled={stepIndex === 0}>
              Previous
            </button>
            <button type="button" onClick={reset}>
              Reset
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={goForward}
              disabled={stepIndex === steps.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>

      <MatchingBoard step={step} />
    </div>
  );
}
