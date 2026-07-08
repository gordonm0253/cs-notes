import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// A deliberately sparse 3CNF chosen to keep the picture readable:
//   (x1 v x2 v x3) ^ (-x1 v x4 v x5) ^ (x2 v -x4 v x6)
// Only x1 and x4 appear both positive and negated, so there are just two
// consistency edges (x1--x1 and x4--x4) instead of a tangle of them.
//
// A literal is written as {var, neg}. `neg = true` means the negated literal.
const clauses = [
  [
    {var: 1, neg: false},
    {var: 2, neg: false},
    {var: 3, neg: false},
  ],
  [
    {var: 1, neg: true},
    {var: 4, neg: false},
    {var: 5, neg: false},
  ],
  [
    {var: 2, neg: false},
    {var: 4, neg: true},
    {var: 6, neg: false},
  ],
];

function literalText(literal) {
  return literal.neg ? `¬x${literal.var}` : `x${literal.var}`;
}

// Lay out the three clause gadgets as triangles across the canvas.
const gadgetCenters = [
  {x: 150, y: 150},
  {x: 400, y: 150},
  {x: 650, y: 150},
];
const triangleRadius = 74;
// Node angles (degrees): top, bottom-left, bottom-right of each triangle.
const triangleAngles = [-90, 150, 30];

const nodes = [];
clauses.forEach((literals, clauseIndex) => {
  const center = gadgetCenters[clauseIndex];

  literals.forEach((literal, slot) => {
    const angle = (triangleAngles[slot] * Math.PI) / 180;

    nodes.push({
      id: `${clauseIndex}-${slot}`,
      clause: clauseIndex,
      slot,
      literal,
      label: literalText(literal),
      x: center.x + triangleRadius * Math.cos(angle),
      y: center.y + triangleRadius * Math.sin(angle),
    });
  });
});

const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

// Triangle edges connect the three literals within one clause gadget.
const triangleEdges = [];
clauses.forEach((literals, clauseIndex) => {
  for (let a = 0; a < literals.length; a += 1) {
    for (let b = a + 1; b < literals.length; b += 1) {
      triangleEdges.push({
        id: `tri-${clauseIndex}-${a}-${b}`,
        from: `${clauseIndex}-${a}`,
        to: `${clauseIndex}-${b}`,
      });
    }
  }
});

// Consistency edges connect a literal to its negation across different clauses.
const consistencyEdges = [];
for (let i = 0; i < nodes.length; i += 1) {
  for (let j = i + 1; j < nodes.length; j += 1) {
    const a = nodes[i];
    const b = nodes[j];

    if (a.clause === b.clause) {
      continue;
    }

    if (a.literal.var === b.literal.var && a.literal.neg !== b.literal.neg) {
      consistencyEdges.push({id: `con-${a.id}-${b.id}`, from: a.id, to: b.id});
    }
  }
}

// Straight segment, used for triangle edges inside a gadget.
function edgeGeometry(edge) {
  const from = nodeById[edge.from];
  const to = nodeById[edge.to];

  return {x1: from.x, y1: from.y, x2: to.x, y2: to.y};
}

// The vertical center of the row of gadgets; arcs bow away from it so they
// never cut across the triangles.
const rowCenterY = gadgetCenters[0].y;

// Consistency edges are drawn as quadratic-bezier arcs that bow above or below
// the gadget row, keeping them visually distinct from the straight triangle
// edges. Endpoints in the top half bow up; the rest bow down. Longer spans
// (skipping over a gadget) bow further so nested arcs stay separated, and each
// variable gets a small extra offset so two arcs bowing the same way fan apart
// instead of overlapping.
const variableFan = {1: 0, 2: 26, 3: 52};

function consistencyArc(edge) {
  const from = nodeById[edge.from];
  const to = nodeById[edge.to];
  const midX = (from.x + to.x) / 2;
  const span = Math.abs(to.x - from.x);
  const bowUp = (from.y + to.y) / 2 < rowCenterY;
  const height = Math.min(160, 64 + span * 0.2) + (variableFan[from.literal.var] ?? 0);
  const controlY = bowUp ? rowCenterY - height : rowCenterY + height;
  const path = `M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`;

  return {path};
}

// Progressive reveal: each step turns on more of the construction.
const steps = [
  {
    title: 'One gadget per clause',
    text:
      'Each clause becomes a gadget of three nodes, one per literal. We have three clauses, so nine nodes in total. Nothing is connected yet.',
    showTriangles: false,
    showConsistency: false,
  },
  {
    title: 'Triangle edges inside each gadget',
    text:
      'Connect the three nodes of every clause into a triangle. Because a triangle has no independent set of size two, at most one node per gadget can enter S.',
    showTriangles: true,
    showConsistency: false,
  },
  {
    title: 'Consistency edges between contradictory literals',
    text:
      'Whenever a literal and its negation appear (e.g. x1 and ¬x1), join those nodes with an edge. These edges forbid picking a variable and its negation at the same time.',
    showTriangles: true,
    showConsistency: true,
  },
];

function ConstructionGraph({step}) {
  const activeNodes = useMemo(() => new Set(nodes.map((node) => node.id)), []);

  return (
    <svg
      className={styles.graph}
      viewBox="0 -18 800 336"
      role="img"
      aria-label="3SAT to Independent Set construction graph">
      <g>
        {step.showTriangles &&
          triangleEdges.map((edge) => {
            const g = edgeGeometry(edge);

            return (
              <line
                key={edge.id}
                className={styles.triangleEdge}
                x1={g.x1}
                y1={g.y1}
                x2={g.x2}
                y2={g.y2}
              />
            );
          })}
      </g>

      <g>
        {step.showConsistency &&
          consistencyEdges.map((edge) => {
            const arc = consistencyArc(edge);

            return <path key={edge.id} className={styles.consistencyEdge} d={arc.path} />;
          })}
      </g>

      <g>
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              className={clsx(styles.node, activeNodes.has(node.id) && styles.placedNode)}
              cx={node.x}
              cy={node.y}
              r="20"
            />
            <text className={styles.nodeLabel} x={node.x} y={node.y}>
              {node.label}
            </text>
          </g>
        ))}
      </g>

      <g>
        {gadgetCenters.map((center, index) => (
          <text
            key={`clause-${index}`}
            className={styles.gadgetLabel}
            x={center.x}
            y={300}>
            {`C${index + 1}`}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function ThreeSatIndependentSet() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const goForward = () => setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  const reset = () => setStepIndex(0);

  return (
    <div className={styles.visualizer}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>3SAT &#8594; Independent Set</p>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </div>
        <div className={styles.target}>
          <span>Target size k</span>
          <strong>{clauses.length}</strong>
        </div>
      </div>

      <div className={styles.formula} aria-label="Formula being reduced">
        (x<sub>1</sub> &or; x<sub>2</sub> &or; x<sub>3</sub>) &and; (&not;x<sub>1</sub> &or; x
        <sub>4</sub> &or; x<sub>5</sub>) &and; (x<sub>2</sub> &or; &not;x<sub>4</sub> &or; x
        <sub>6</sub>)
      </div>

      <div className={styles.stepRail} aria-label="Reduction steps">
        {steps.map((item, index) => (
          <button
            className={clsx(index === stepIndex && styles.stepDotActive)}
            key={item.title}
            type="button"
            onClick={() => setStepIndex(index)}
            aria-label={`Go to step ${index + 1}: ${item.title}`}>
            <span>{index + 1}</span>
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <ConstructionGraph step={step} />
      </div>

      <div className={styles.footer}>
        <div className={styles.legend} aria-label="Legend">
          <span>
            <i className={styles.legendTriangle} /> triangle edge
          </span>
          <span>
            <i className={styles.legendConsistency} /> consistency edge
          </span>
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
  );
}
