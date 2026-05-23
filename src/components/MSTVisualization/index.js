import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const nodes = [
  {id: 'A', x: 82, y: 96},
  {id: 'B', x: 214, y: 60},
  {id: 'C', x: 182, y: 164},
  {id: 'D', x: 340, y: 126},
  {id: 'E', x: 420, y: 222},
  {id: 'F', x: 548, y: 158},
];

const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

const edges = [
  {id: 'AB', from: 'A', to: 'B', weight: 4},
  {id: 'AC', from: 'A', to: 'C', weight: 3},
  {id: 'BC', from: 'B', to: 'C', weight: 1},
  {id: 'BD', from: 'B', to: 'D', weight: 2},
  {id: 'CD', from: 'C', to: 'D', weight: 3},
  {id: 'CE', from: 'C', to: 'E', weight: 5},
  {id: 'DE', from: 'D', to: 'E', weight: 1},
  {id: 'DF', from: 'D', to: 'F', weight: 6},
  {id: 'EF', from: 'E', to: 'F', weight: 2},
];

const edgeById = Object.fromEntries(edges.map((edge) => [edge.id, edge]));
const kruskalOrder = ['BC', 'DE', 'BD', 'EF', 'CD', 'AC', 'AB', 'CE', 'DF'];

const primSteps = [
  {
    title: 'Start at A',
    text: 'The tree contains A. Prim looks only at edges crossing from the tree to the outside.',
    selected: [],
    frontier: ['AB', 'AC'],
    treeNodes: ['A'],
  },
  {
    title: 'Take A-C',
    text: 'A-C is the cheapest edge leaving the current tree.',
    active: 'AC',
    selected: ['AC'],
    frontier: ['AB', 'BC', 'CD', 'CE'],
    treeNodes: ['A', 'C'],
  },
  {
    title: 'Take B-C',
    text: 'B-C is now the lightest crossing edge, so B joins the tree.',
    active: 'BC',
    selected: ['AC', 'BC'],
    frontier: ['AB', 'BD', 'CD', 'CE'],
    treeNodes: ['A', 'B', 'C'],
  },
  {
    title: 'Take B-D',
    text: 'B-D is the cheapest edge from the tree into the remaining vertices.',
    active: 'BD',
    selected: ['AC', 'BC', 'BD'],
    frontier: ['CE', 'DE', 'DF'],
    treeNodes: ['A', 'B', 'C', 'D'],
  },
  {
    title: 'Take D-E',
    text: 'D-E has weight 1, so E enters before the heavier alternatives.',
    active: 'DE',
    selected: ['AC', 'BC', 'BD', 'DE'],
    frontier: ['CE', 'DF', 'EF'],
    treeNodes: ['A', 'B', 'C', 'D', 'E'],
  },
  {
    title: 'Take E-F',
    text: 'E-F is the cheapest way to reach F. The tree now spans every vertex.',
    active: 'EF',
    selected: ['AC', 'BC', 'BD', 'DE', 'EF'],
    frontier: [],
    treeNodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
];

const kruskalSteps = [
  {
    title: 'Sort all edges',
    text: 'Kruskal scans edges by increasing weight and adds an edge only when it connects two different components.',
    selected: [],
    considered: [],
    rejected: [],
    active: null,
    components: [['A'], ['B'], ['C'], ['D'], ['E'], ['F']],
  },
  {
    title: 'Take B-C',
    text: 'B-C has weight 1 and cannot create a cycle, so it enters the MST.',
    active: 'BC',
    selected: ['BC'],
    considered: ['BC'],
    rejected: [],
    components: [['A'], ['B', 'C'], ['D'], ['E'], ['F']],
  },
  {
    title: 'Take D-E',
    text: 'D-E is another weight-1 edge connecting two separate components.',
    active: 'DE',
    selected: ['BC', 'DE'],
    considered: ['BC', 'DE'],
    rejected: [],
    components: [['A'], ['B', 'C'], ['D', 'E'], ['F']],
  },
  {
    title: 'Take B-D',
    text: 'B-D joins the {B, C} component to the {D, E} component.',
    active: 'BD',
    selected: ['BC', 'DE', 'BD'],
    considered: ['BC', 'DE', 'BD'],
    rejected: [],
    components: [['A'], ['B', 'C', 'D', 'E'], ['F']],
  },
  {
    title: 'Take E-F',
    text: 'E-F brings F into the growing forest.',
    active: 'EF',
    selected: ['BC', 'DE', 'BD', 'EF'],
    considered: ['BC', 'DE', 'BD', 'EF'],
    rejected: [],
    components: [['A'], ['B', 'C', 'D', 'E', 'F']],
  },
  {
    title: 'Skip C-D',
    text: 'C-D is light, but C and D are already in the same component. Adding it would create a cycle.',
    active: 'CD',
    selected: ['BC', 'DE', 'BD', 'EF'],
    considered: ['BC', 'DE', 'BD', 'EF', 'CD'],
    rejected: ['CD'],
    components: [['A'], ['B', 'C', 'D', 'E', 'F']],
  },
  {
    title: 'Take A-C',
    text: 'A-C has the same weight as C-D, but it connects two different components, so it completes the spanning tree.',
    active: 'AC',
    selected: ['BC', 'DE', 'BD', 'EF', 'AC'],
    considered: ['BC', 'DE', 'BD', 'EF', 'CD', 'AC'],
    rejected: ['CD'],
    components: [['A', 'B', 'C', 'D', 'E', 'F']],
  },
];

const algorithms = {
  prim: {
    label: "Prim's",
    steps: primSteps,
    summary: 'Grow one tree by repeatedly choosing the cheapest crossing edge.',
  },
  kruskal: {
    label: "Kruskal's",
    steps: kruskalSteps,
    summary: 'Scan edges from lightest to heaviest, skipping anything that forms a cycle.',
  },
};

function getEdgeLabelPosition(edge) {
  const from = nodeById[edge.from];
  const to = nodeById[edge.to];
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

function Graph({step}) {
  const selected = useMemo(() => new Set(step.selected), [step.selected]);
  const frontier = useMemo(() => new Set(step.frontier ?? []), [step.frontier]);
  const rejected = useMemo(() => new Set(step.rejected ?? []), [step.rejected]);
  const considered = useMemo(() => new Set(step.considered ?? []), [step.considered]);
  const treeNodes = useMemo(() => {
    if (step.treeNodes) {
      return new Set(step.treeNodes);
    }

    return new Set(
      step.selected.flatMap((edgeId) => {
        const edge = edgeById[edgeId];
        return [edge.from, edge.to];
      }),
    );
  }, [step.selected, step.treeNodes]);

  return (
    <svg className={styles.graph} viewBox="0 0 630 300" role="img" aria-label="Weighted graph">
      <g>
        {edges.map((edge) => {
          const from = nodeById[edge.from];
          const to = nodeById[edge.to];
          const label = getEdgeLabelPosition(edge);
          const isActive = step.active === edge.id;

          return (
            <g key={edge.id}>
              <line
                className={clsx(
                  styles.edge,
                  frontier.has(edge.id) && styles.frontierEdge,
                  considered.has(edge.id) && styles.consideredEdge,
                  rejected.has(edge.id) && styles.rejectedEdge,
                  selected.has(edge.id) && styles.selectedEdge,
                  isActive && styles.activeEdge,
                )}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
              <circle className={styles.weightHalo} cx={label.x} cy={label.y} r="12" />
              <text className={styles.weightLabel} x={label.x} y={label.y + 4}>
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
              className={clsx(
                styles.node,
                treeNodes.has(node.id) && styles.treeNode,
              )}
              cx={node.x}
              cy={node.y}
              r="20"
            />
            <text className={styles.nodeLabel} x={node.x} y={node.y + 5}>
              {node.id}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function EdgeList({step, algorithm}) {
  const selected = new Set(step.selected);
  const rejected = new Set(step.rejected ?? []);
  const active = step.active;
  const orderedEdges =
    algorithm === 'kruskal'
      ? kruskalOrder.map((edgeId) => edgeById[edgeId])
      : edges;

  return (
    <div className={styles.edgeList} aria-label="Edge weights">
      {orderedEdges.map((edge) => (
        <div
          className={clsx(
            styles.edgePill,
            selected.has(edge.id) && styles.edgePillSelected,
            rejected.has(edge.id) && styles.edgePillRejected,
            active === edge.id && styles.edgePillActive,
          )}
          key={edge.id}>
          <span>
            {edge.from}-{edge.to}
          </span>
          <strong>{edge.weight}</strong>
        </div>
      ))}
    </div>
  );
}

function ComponentList({components}) {
  if (!components) {
    return null;
  }

  return (
    <div className={styles.componentPanel} aria-label="Kruskal components">
      <span>Components</span>
      <div className={styles.componentList}>
        {components.map((component) => (
          <code className={styles.componentSet} key={component.join('')}>
            {'{'}
            {component.join(', ')}
            {'}'}
          </code>
        ))}
      </div>
    </div>
  );
}

export default function MSTVisualization() {
  const [algorithm, setAlgorithm] = useState('prim');
  const [stepIndex, setStepIndex] = useState(0);
  const config = algorithms[algorithm];
  const step = config.steps[stepIndex];
  const totalWeight = step.selected.reduce(
    (sum, edgeId) => sum + edgeById[edgeId].weight,
    0,
  );

  const chooseAlgorithm = (nextAlgorithm) => {
    setAlgorithm(nextAlgorithm);
    setStepIndex(0);
  };

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const goForward = () =>
    setStepIndex((current) => Math.min(config.steps.length - 1, current + 1));
  const reset = () => setStepIndex(0);

  return (
    <div className={styles.framework}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Minimum Spanning Tree</p>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.segmented} aria-label="Choose MST algorithm">
            {Object.entries(algorithms).map(([key, value]) => (
              <button
                className={clsx(key === algorithm && styles.segmentedActive)}
                key={key}
                type="button"
                onClick={() => chooseAlgorithm(key)}>
                {value.label}
              </button>
            ))}
          </div>
          <div className={styles.stepBadge}>
            Step {stepIndex + 1} / {config.steps.length}
          </div>
        </div>
      </div>

      <div className={styles.visualArea}>
        <Graph step={step} />
        <aside className={styles.details} aria-label="MST step details">
          <p className={styles.algorithmSummary}>{config.summary}</p>
          <div className={styles.metricGrid}>
            <div>
              <span>Chosen edges</span>
              <strong>{step.selected.length}</strong>
            </div>
            <div>
              <span>Total weight</span>
              <strong>{totalWeight}</strong>
            </div>
          </div>
          <ComponentList components={step.components} />
          <EdgeList step={step} algorithm={algorithm} />
        </aside>
      </div>

      <div className={styles.footer}>
        <div className={styles.legend} aria-label="Legend">
          <span>
            <i className={styles.legendSelected} /> accepted
          </span>
          <span>
            <i className={styles.legendActive} /> current
          </span>
          <span>
            <i className={styles.legendFrontier} /> candidate
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
            disabled={stepIndex === config.steps.length - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
