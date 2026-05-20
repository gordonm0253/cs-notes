import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const hospitals = ['H1', 'H2', 'H3', 'H4'];
const residents = ['R1', 'R2', 'R3', 'R4'];

const hospitalPreferences = {
  H1: ['R2', 'R1', 'R3', 'R4'],
  H2: ['R1', 'R2', 'R4', 'R3'],
  H3: ['R1', 'R3', 'R2', 'R4'],
  H4: ['R3', 'R4', 'R2', 'R1'],
};

const residentPreferences = {
  R1: ['H3', 'H2', 'H1', 'H4'],
  R2: ['H1', 'H2', 'H4', 'H3'],
  R3: ['H4', 'H3', 'H1', 'H2'],
  R4: ['H2', 'H4', 'H3', 'H1'],
};

const steps = [
  {
    title: 'Start with everyone unmatched',
    text: 'Each hospital proposes down its preference list until every resident holds one proposal.',
    proposals: [],
    matches: {},
    activeHospital: null,
  },
  {
    title: 'H1 proposes to R2',
    text: 'R2 is unmatched, so R2 holds H1 for now. H1 and R2 are tentatively matched.',
    proposals: [['H1', 'R2']],
    matches: {R2: 'H1'},
    activeHospital: 'H1',
  },
  {
    title: 'H2 proposes to R1',
    text: 'R1 is unmatched, so R1 holds H2. Tentative matches can still change later.',
    proposals: [
      ['H1', 'R2'],
      ['H2', 'R1'],
    ],
    matches: {R2: 'H1', R1: 'H2'},
    activeHospital: 'H2',
  },
  {
    title: 'H3 proposes to R1',
    text: 'R1 prefers H3 over H2, so R1 switches to H3. H2 becomes unmatched again.',
    proposals: [
      ['H1', 'R2'],
      ['H2', 'R1'],
      ['H3', 'R1'],
    ],
    matches: {R2: 'H1', R1: 'H3'},
    activeHospital: 'H3',
    rejected: ['H2', 'R1'],
  },
  {
    title: 'H2 proposes to R2',
    text: 'R2 prefers H1 over H2, so R2 rejects H2. H2 will keep moving down the list.',
    proposals: [
      ['H1', 'R2'],
      ['H2', 'R1'],
      ['H3', 'R1'],
      ['H2', 'R2'],
    ],
    matches: {R2: 'H1', R1: 'H3'},
    activeHospital: 'H2',
    rejected: ['H2', 'R2'],
  },
  {
    title: 'H4 proposes to R3',
    text: 'R3 is unmatched, so R3 holds H4. Only H2 remains unmatched.',
    proposals: [
      ['H1', 'R2'],
      ['H2', 'R1'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H4', 'R3'],
    ],
    matches: {R2: 'H1', R1: 'H3', R3: 'H4'},
    activeHospital: 'H4',
  },
  {
    title: 'H2 proposes to R4',
    text: 'R4 is unmatched, so R4 holds H2. Everyone is matched and the algorithm terminates.',
    proposals: [
      ['H1', 'R2'],
      ['H2', 'R1'],
      ['H3', 'R1'],
      ['H2', 'R2'],
      ['H4', 'R3'],
      ['H2', 'R4'],
    ],
    matches: {R2: 'H1', R1: 'H3', R3: 'H4', R4: 'H2'},
    activeHospital: 'H2',
  },
];

function rank(preferences, option) {
  return preferences.indexOf(option) + 1;
}

function PreferenceList({title, items, preferences, activeName}) {
  return (
    <section className={styles.panel}>
      <h3>{title}</h3>
      <div className={styles.preferenceGrid}>
        {items.map((name) => (
          <div
            className={clsx(styles.preferenceRow, name === activeName && styles.activeRow)}
            key={name}>
            <span className={styles.preferenceName}>{name}</span>
            <ol>
              {preferences[name].map((choice) => (
                <li key={choice}>{choice}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchingBoard({step}) {
  const matchedHospitals = useMemo(
    () => new Set(Object.values(step.matches)),
    [step.matches],
  );
  const proposalsByHospital = useMemo(
    () =>
      step.proposals.reduce((groups, [hospital, resident]) => {
        groups[hospital] = [...(groups[hospital] ?? []), resident];
        return groups;
      }, {}),
    [step.proposals],
  );
  const proposalsByResident = useMemo(
    () =>
      step.proposals.reduce((groups, [hospital, resident]) => {
        groups[resident] = [...(groups[resident] ?? []), hospital];
        return groups;
      }, {}),
    [step.proposals],
  );
  const latestProposal = step.proposals[step.proposals.length - 1];
  const latestKey = latestProposal ? `${latestProposal[0]}-${latestProposal[1]}` : null;
  const rejectedKey = step.rejected ? `${step.rejected[0]}-${step.rejected[1]}` : null;

  return (
    <section className={styles.board} aria-label="Stable matching proposal board">
      <div className={styles.boardColumn}>
        <h3>Hospitals</h3>
        {hospitals.map((hospital) => {
          const proposedTo = proposalsByHospital[hospital] ?? [];
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
                <small>{matchedHospitals.has(hospital) ? 'matched' : 'free'}</small>
              </div>
              <div className={styles.proposalTrail} aria-label={`${hospital} proposals`}>
                <small className={styles.trailLabel}>Proposed to</small>
                {proposedTo.length === 0 ? (
                  <small className={styles.noProposal}>No proposals yet</small>
                ) : (
                  proposedTo.map((resident) => {
                    const key = `${hospital}-${resident}`;
                    return (
                      <span
                        className={clsx(
                          styles.proposalChip,
                          latestKey === key && styles.latestProposal,
                          rejectedKey === key && styles.rejectedProposal,
                          step.matches[resident] === hospital && styles.heldProposal,
                        )}
                        key={key}>
                        {resident}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.boardColumn}>
        <h3>Residents</h3>
        {residents.map((resident) => {
          const match = step.matches[resident];
          const offers = proposalsByResident[resident] ?? [];
          return (
            <div
              className={clsx(styles.person, match && styles.matchedPerson)}
              key={resident}>
              <div className={styles.personHeader}>
                <span>{resident}</span>
                <small>{match ? `holding ${match}` : 'free'}</small>
              </div>
              <div className={styles.proposalTrail} aria-label={`${resident} received offers`}>
                <small className={styles.trailLabel}>Offers</small>
                {offers.length === 0 ? (
                  <small className={styles.noProposal}>No offers yet</small>
                ) : (
                  offers.map((hospital) => {
                    const key = `${hospital}-${resident}`;
                    return (
                      <span
                        className={clsx(
                          styles.proposalChip,
                          latestKey === key && styles.latestProposal,
                          rejectedKey === key && styles.rejectedProposal,
                          match === hospital && styles.heldProposal,
                        )}
                        key={key}>
                        {hospital}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MatchSummary({matches}) {
  return (
    <section className={styles.panel}>
      <h3>Current Matching</h3>
      <div className={styles.matchGrid}>
        {residents.map((resident) => {
          const hospital = matches[resident];
          return (
            <div className={styles.matchCard} key={resident}>
              <span>{resident}</span>
              <strong>{hospital ?? '-'}</strong>
              <small>
                {hospital
                  ? `${resident} ranks ${hospital} #${rank(residentPreferences[resident], hospital)}`
                  : 'unmatched'}
              </small>
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
        <div className={styles.stepBadge}>
          Step {stepIndex + 1} / {steps.length}
        </div>
      </div>

      <MatchingBoard step={step} />

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

      <div className={styles.detailGrid}>
        <PreferenceList
          title="Hospital Preferences"
          items={hospitals}
          preferences={hospitalPreferences}
          activeName={step.activeHospital}
        />
        <PreferenceList
          title="Resident Preferences"
          items={residents}
          preferences={residentPreferences}
        />
        <MatchSummary matches={step.matches} />
      </div>
    </div>
  );
}
