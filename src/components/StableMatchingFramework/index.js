import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const suitors = ['A', 'B', 'C', 'D'];
const reviewers = ['W', 'X', 'Y', 'Z'];

const suitorPreferences = {
  A: ['X', 'W', 'Y', 'Z'],
  B: ['W', 'X', 'Z', 'Y'],
  C: ['W', 'Y', 'X', 'Z'],
  D: ['Y', 'Z', 'X', 'W'],
};

const reviewerPreferences = {
  W: ['C', 'B', 'A', 'D'],
  X: ['A', 'B', 'D', 'C'],
  Y: ['D', 'C', 'A', 'B'],
  Z: ['B', 'D', 'C', 'A'],
};

const steps = [
  {
    title: 'Start with everyone unmatched',
    text: 'Each suitor will propose down their preference list until every reviewer holds one proposal.',
    proposals: [],
    matches: {},
    activeSuitor: null,
  },
  {
    title: 'A proposes to X',
    text: 'X is unmatched, so X holds A for now. A and X are tentatively matched.',
    proposals: [['A', 'X']],
    matches: {X: 'A'},
    activeSuitor: 'A',
  },
  {
    title: 'B proposes to W',
    text: 'W is unmatched, so W holds B. Tentative matches can still change later.',
    proposals: [
      ['A', 'X'],
      ['B', 'W'],
    ],
    matches: {X: 'A', W: 'B'},
    activeSuitor: 'B',
  },
  {
    title: 'C proposes to W',
    text: 'W prefers C over B, so W switches to C. B becomes unmatched again.',
    proposals: [
      ['A', 'X'],
      ['B', 'W'],
      ['C', 'W'],
    ],
    matches: {X: 'A', W: 'C'},
    activeSuitor: 'C',
    rejected: ['B', 'W'],
  },
  {
    title: 'B proposes to X',
    text: 'X prefers A over B, so X rejects B. B will keep moving down the list.',
    proposals: [
      ['A', 'X'],
      ['B', 'W'],
      ['C', 'W'],
      ['B', 'X'],
    ],
    matches: {X: 'A', W: 'C'},
    activeSuitor: 'B',
    rejected: ['B', 'X'],
  },
  {
    title: 'D proposes to Y',
    text: 'Y is unmatched, so Y holds D. Only B remains unmatched.',
    proposals: [
      ['A', 'X'],
      ['B', 'W'],
      ['C', 'W'],
      ['B', 'X'],
      ['D', 'Y'],
    ],
    matches: {X: 'A', W: 'C', Y: 'D'},
    activeSuitor: 'D',
  },
  {
    title: 'B proposes to Z',
    text: 'Z is unmatched, so Z holds B. Everyone is matched and the algorithm terminates.',
    proposals: [
      ['A', 'X'],
      ['B', 'W'],
      ['C', 'W'],
      ['B', 'X'],
      ['D', 'Y'],
      ['B', 'Z'],
    ],
    matches: {X: 'A', W: 'C', Y: 'D', Z: 'B'},
    activeSuitor: 'B',
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
  const matchedSuitors = useMemo(
    () => new Set(Object.values(step.matches)),
    [step.matches],
  );
  const proposalSet = useMemo(
    () => new Set(step.proposals.map(([from, to]) => `${from}-${to}`)),
    [step.proposals],
  );
  const rejectedKey = step.rejected ? `${step.rejected[0]}-${step.rejected[1]}` : null;

  return (
    <section className={styles.board} aria-label="Stable matching proposal board">
      <div className={styles.boardColumn}>
        <h3>Suitors</h3>
        {suitors.map((suitor) => (
          <div
            className={clsx(
              styles.person,
              step.activeSuitor === suitor && styles.activePerson,
              matchedSuitors.has(suitor) && styles.matchedPerson,
            )}
            key={suitor}>
            <span>{suitor}</span>
            <small>{matchedSuitors.has(suitor) ? 'matched' : 'free'}</small>
          </div>
        ))}
      </div>

      <div className={styles.proposalColumn}>
        <h3>Proposal History</h3>
        <div className={styles.proposalList}>
          {step.proposals.length === 0 ? (
            <p className={styles.emptyState}>No proposals yet.</p>
          ) : (
            step.proposals.map(([from, to], index) => {
              const key = `${from}-${to}`;
              return (
                <div
                  className={clsx(
                    styles.proposal,
                    rejectedKey === key && styles.rejectedProposal,
                    proposalSet.has(key) && styles.seenProposal,
                  )}
                  key={`${key}-${index}`}>
                  <span>{from}</span>
                  <span aria-hidden="true">-&gt;</span>
                  <span>{to}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.boardColumn}>
        <h3>Reviewers</h3>
        {reviewers.map((reviewer) => {
          const match = step.matches[reviewer];
          return (
            <div
              className={clsx(styles.person, match && styles.matchedPerson)}
              key={reviewer}>
              <span>{reviewer}</span>
              <small>{match ? `holding ${match}` : 'free'}</small>
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
        {reviewers.map((reviewer) => {
          const suitor = matches[reviewer];
          return (
            <div className={styles.matchCard} key={reviewer}>
              <span>{reviewer}</span>
              <strong>{suitor ?? '-'}</strong>
              <small>
                {suitor
                  ? `${reviewer} ranks ${suitor} #${rank(reviewerPreferences[reviewer], suitor)}`
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
          title="Suitor Preferences"
          items={suitors}
          preferences={suitorPreferences}
          activeName={step.activeSuitor}
        />
        <PreferenceList
          title="Reviewer Preferences"
          items={reviewers}
          preferences={reviewerPreferences}
        />
        <MatchSummary matches={step.matches} />
      </div>
    </div>
  );
}
