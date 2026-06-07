import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const INF = Number.POSITIVE_INFINITY;
const BLANK = null;

const nodes = [
  {id: 's', label: 's', x: 72, y: 160},
  {id: 'a', label: 'a', x: 238, y: 76},
  {id: 'b', label: 'b', x: 238, y: 244},
  {id: 'c', label: 'c', x: 438, y: 160},
];

const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

const edges = [
  {id: 's-a', from: 's', to: 'a', weight: 4, curve: -10, labelOffset: {x: -8, y: -10}},
  {id: 's-b', from: 's', to: 'b', weight: 5, curve: 10, labelOffset: {x: -8, y: 10}},
  {id: 'b-a', from: 'b', to: 'a', weight: -2, curve: 0, labelOffset: {x: -22, y: 0}},
  {id: 'a-c', from: 'a', to: 'c', weight: 3, curve: -8, labelOffset: {x: 10, y: -12}},
  {id: 'b-c', from: 'b', to: 'c', weight: 4, curve: 8, labelOffset: {x: 10, y: 12}},
];

const edgeById = Object.fromEntries(edges.map((edge) => [edge.id, edge]));
const nodeIndexById = Object.fromEntries(nodes.map((node, index) => [node.id, index]));

function formatValue(value) {
  if (value === BLANK) {
    return '-';
  }

  return value === INF ? '∞' : value;
}

function getIncomingEdges(vertex) {
  return edges.filter((edge) => edge.to === vertex);
}

function buildDpRows() {
  const rows = [
    Object.fromEntries(nodes.map((node) => [node.id, node.id === 's' ? 0 : INF])),
  ];
  const choices = [
    Object.fromEntries(nodes.map((node) => [node.id, {kind: node.id === 's' ? 'source' : 'init', edgeId: null}])),
  ];

  for (let k = 1; k < nodes.length; k += 1) {
    const previous = rows[k - 1];
    const row = Object.fromEntries(nodes.map((node) => [node.id, node.id === 's' ? 0 : INF]));
    const rowChoices = {};

    nodes.forEach((node) => {
      const carry = previous[node.id];
      let best = node.id === 's' ? 0 : carry;
      let bestEdgeId = null;

      getIncomingEdges(node.id).forEach((edge) => {
        const sourceDistance = previous[edge.from];
        if (sourceDistance === INF || sourceDistance === BLANK) {
          return;
        }

        const candidate = sourceDistance + edge.weight;
        if (candidate < best) {
          best = candidate;
          bestEdgeId = edge.id;
        }
      });

      row[node.id] = best;
      rowChoices[node.id] = {
        kind: bestEdgeId ? 'relax' : node.id === 's' ? 'source' : best === carry ? 'carry' : 'base',
        edgeId: bestEdgeId,
      };
    });

    rows.push(row);
    choices.push(rowChoices);
  }

  return {rows, choices};
}

const {rows: dpRows, choices} = buildDpRows();

function getRowLabel(rowIndex) {
  return String(rowIndex);
}

const steps = dpRows.flatMap((row, rowIndex) =>
  nodes.map((node) => {
    const choice = choices[rowIndex][node.id];
    const previous = rowIndex > 0 ? dpRows[rowIndex - 1][node.id] : null;
    const current = row[node.id];
    const edge = choice.edgeId ? edgeById[choice.edgeId] : null;
    const candidate =
      edge && dpRows[rowIndex - 1][edge.from] !== INF
        ? dpRows[rowIndex - 1][edge.from] + edge.weight
        : null;

    return {
      rowIndex,
      rowLabel: getRowLabel(rowIndex),
      vertex: node.id,
      value: current,
      previous,
      edgeId: choice.edgeId,
      kind: choice.kind,
      candidate,
      title:
        choice.kind === 'source'
          ? rowIndex === 0
            ? 'Initialize base case'
            : `Carry s into row ${rowIndex}`
          : choice.kind === 'init'
            ? `Initialize ${node.id}`
            : choice.edgeId
              ? `Relax ${edge.from} -> ${edge.to}`
              : `Carry ${node.id}`,
      text:
        choice.kind === 'source'
          ? rowIndex === 0
            ? 'The base case sets the source distance to 0 before any edges are used.'
            : `The source stays 0 in row ${rowIndex}.`
          : choice.kind === 'init'
            ? `${node.id} starts at positive infinity before any edge is used.`
            : choice.edgeId
              ? `${edge.from} reaches ${node.id} with ${formatValue(dpRows[rowIndex - 1][edge.from])} + ${edge.weight} = ${candidate}, improving the value from ${formatValue(previous)}.`
              : `No incoming edge improves ${node.id}, so the row keeps ${formatValue(current)} from the previous row.`,
    };
  }),
);

function getEdgeGeometry(edge) {
  const from = nodeById[edge.from];
  const to = nodeById[edge.to];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const unitX = dx / length;
  const unitY = dy / length;
  const normalX = -unitY;
  const normalY = unitX;
  const start = {
    x: from.x + unitX * 25,
    y: from.y + unitY * 25,
  };
  const end = {
    x: to.x - unitX * 30,
    y: to.y - unitY * 30,
  };
  const control = {
    x: (start.x + end.x) / 2 + normalX * edge.curve,
    y: (start.y + end.y) / 2 + normalY * edge.curve,
  };
  const label = {
    x: (start.x + end.x + control.x) / 3 + (edge.labelOffset?.x ?? 0),
    y: (start.y + end.y + control.y) / 3 + (edge.labelOffset?.y ?? 0),
  };

  return {start, end, control, label};
}

function Graph({step}) {
  const activeEdge = step.edgeId;
  const activeNodes = useMemo(
    () => new Set([step.vertex, activeEdge ? edgeById[activeEdge].from : null].filter(Boolean)),
    [activeEdge, step.vertex],
  );

  return (
    <svg className={styles.graph} viewBox="0 0 530 320" role="img" aria-label="Directed weighted Bellman-Ford graph">
      <defs>
        <marker id="bellman-arrow" markerHeight="9" markerWidth="9" orient="auto" refX="7" refY="4.5">
          <path d="M0,0 L9,4.5 L0,9 Z" className={styles.arrowHead} />
        </marker>
        <marker id="bellman-active-arrow" markerHeight="9" markerWidth="9" orient="auto" refX="7" refY="4.5">
          <path d="M0,0 L9,4.5 L0,9 Z" className={styles.activeArrowHead} />
        </marker>
      </defs>

      <g>
        {edges.map((edge) => {
          const geometry = getEdgeGeometry(edge);
          const isActive = edge.id === activeEdge;

          return (
            <g key={edge.id}>
              <path
                className={clsx(styles.edge, edge.weight < 0 && styles.negativeEdge, isActive && styles.activeEdge)}
                d={`M ${geometry.start.x} ${geometry.start.y} Q ${geometry.control.x} ${geometry.control.y} ${geometry.end.x} ${geometry.end.y}`}
                markerEnd={isActive ? 'url(#bellman-active-arrow)' : 'url(#bellman-arrow)'}
              />
              <rect
                className={clsx(styles.weightBadge, edge.weight < 0 && styles.negativeBadge, isActive && styles.activeBadge)}
                x={geometry.label.x - 16}
                y={geometry.label.y - 13}
                width="32"
                height="26"
                rx="4"
              />
              <text className={styles.weightText} x={geometry.label.x} y={geometry.label.y + 5}>
                {edge.weight}
              </text>
            </g>
          );
        })}
      </g>

      <g>
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              className={clsx(styles.node, node.id === 's' && styles.sourceNode, activeNodes.has(node.id) && styles.activeNode)}
              cx={node.x}
              cy={node.y}
              r="24"
            />
            <text className={styles.nodeLabel} x={node.x} y={node.y + 6}>
              {node.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function DpTable({step}) {
  const activeCellIndex = nodeIndexById[step.vertex];

  const getDisplayedValue = (row, rowIndex, node) => {
    if (rowIndex < step.rowIndex) {
      return row[node.id];
    }

    if (rowIndex > step.rowIndex) {
      return BLANK;
    }

    return nodeIndexById[node.id] <= activeCellIndex ? row[node.id] : BLANK;
  };

  return (
    <div className={styles.tableWrap} aria-label="Bellman-Ford dynamic programming table">
      <table className={styles.dpTable}>
        <thead>
          <tr>
            <th scope="col">i</th>
            {nodes.map((node) => (
              <th scope="col" key={node.id}>
                {node.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dpRows.map((row, rowIndex) => (
            <tr className={clsx(rowIndex === step.rowIndex && styles.activeRow)} key={rowIndex}>
              <th scope="row">{getRowLabel(rowIndex)}</th>
              {nodes.map((node) => {
                const choice = choices[rowIndex][node.id];
                const isActiveCell = rowIndex === step.rowIndex && node.id === step.vertex;
                const displayedValue = getDisplayedValue(row, rowIndex, node);

                return (
                  <td
                    className={clsx(
                      isActiveCell && styles.activeCell,
                      displayedValue !== BLANK && rowIndex === step.rowIndex && choice.kind === 'carry' && styles.carryCell,
                      displayedValue !== BLANK && rowIndex === step.rowIndex && choice.edgeId && styles.relaxedCell,
                      displayedValue !== BLANK && rowIndex === step.rowIndex && choice.kind === 'source' && styles.sourceCell,
                    )}
                    key={node.id}>
                    {formatValue(displayedValue)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BellmanFordVisualizer() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const maxSteps = steps.length - 1;

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const goForward = () => setStepIndex((current) => Math.min(maxSteps, current + 1));
  const reset = () => setStepIndex(0);

  return (
    <div className={styles.visualizer}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Bellman-Ford DP Visualizer</p>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </div>
        <div className={styles.stepBadge}>
          Step {stepIndex + 1} / {steps.length}
        </div>
      </div>

      <div className={styles.recurrence}>
        <code>dp[i][v] = min(dp[i - 1][v], min(dp[i - 1][u] + w(u, v)))</code>
      </div>

      <div className={styles.mainGrid}>
        <Graph step={step} />
        <section className={styles.tablePanel}>
          <div className={styles.tableIntro}>
            <h3>Full DP table</h3>
            <p>Row 0 initializes s to 0 and every other entry to ∞. Later rows fill in as the simulation progresses.</p>
          </div>
          <DpTable step={step} />
        </section>
      </div>

      <div className={styles.footer}>
        <div className={styles.controls}>
          <button type="button" onClick={goBack} disabled={stepIndex === 0}>
            Previous
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
          <button className={styles.primaryButton} type="button" onClick={goForward} disabled={stepIndex === maxSteps}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
