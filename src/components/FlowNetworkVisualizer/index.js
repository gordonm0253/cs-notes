import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const nodes = [
  {id: 's', label: 's', x: 72, y: 150},
  {id: 'a', label: 'a', x: 260, y: 82},
  {id: 'b', label: 'b', x: 260, y: 218},
  {id: 't', label: 't', x: 528, y: 150},
];

const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

const edges = [
  {id: 's-a', from: 's', to: 'a', capacity: 2},
  {id: 's-b', from: 's', to: 'b', capacity: 1},
  {id: 'a-b', from: 'a', to: 'b', capacity: 2},
  {id: 'a-t', from: 'a', to: 't', capacity: 2},
  {id: 'b-t', from: 'b', to: 't', capacity: 1},
];

const edgeById = Object.fromEntries(edges.map((edge) => [edge.id, edge]));

const augmentations = [
  {
    path: [
      {edgeId: 's-a', direction: 'forward'},
      {edgeId: 'a-b', direction: 'forward'},
      {edgeId: 'b-t', direction: 'forward'},
    ],
  },
  {
    path: [
      {edgeId: 's-a', direction: 'forward'},
      {edgeId: 'a-t', direction: 'forward'},
    ],
  },
  {
    path: [
      {edgeId: 's-b', direction: 'forward'},
      {edgeId: 'a-b', direction: 'backward'},
      {edgeId: 'a-t', direction: 'forward'},
    ],
  },
];

function cloneFlows(flows) {
  return Object.fromEntries(edges.map((edge) => [edge.id, flows[edge.id] ?? 0]));
}

function getResidualCapacity(flows, pathEdge) {
  const edge = edgeById[pathEdge.edgeId];

  if (pathEdge.direction === 'forward') {
    return edge.capacity - flows[edge.id];
  }

  return flows[edge.id];
}

function getPathNodes(path) {
  if (path.length === 0) {
    return [];
  }

  const firstEdge = edgeById[path[0].edgeId];
  const firstNode = path[0].direction === 'forward' ? firstEdge.from : firstEdge.to;

  return path.reduce(
    (pathNodes, pathEdge) => {
      const edge = edgeById[pathEdge.edgeId];
      pathNodes.push(pathEdge.direction === 'forward' ? edge.to : edge.from);
      return pathNodes;
    },
    [firstNode],
  );
}

function formatPath(path) {
  return getPathNodes(path).join(' -> ');
}

function applyAugmentation(flows, path, amount) {
  const nextFlows = cloneFlows(flows);

  path.forEach((pathEdge) => {
    if (pathEdge.direction === 'forward') {
      nextFlows[pathEdge.edgeId] += amount;
    } else {
      nextFlows[pathEdge.edgeId] -= amount;
    }
  });

  return nextFlows;
}

function getTotalFlow(flows) {
  return edges
    .filter((edge) => edge.from === 's')
    .reduce((total, edge) => total + flows[edge.id], 0);
}

function buildSteps() {
  let flows = cloneFlows({});
  const steps = [
    {
      title: 'Start with zero flow',
      text: 'Every edge begins at 0 flow.',
      flows: cloneFlows(flows),
      activePath: [],
      bottleneck: null,
      phase: 'Initialize',
    },
  ];

  augmentations.forEach((augmentation, index) => {
    const residuals = augmentation.path.map((pathEdge) =>
      getResidualCapacity(flows, pathEdge),
    );
    const bottleneck = Math.min(...residuals);
    const pathText = formatPath(augmentation.path);

    steps.push({
      title: `Find path ${index + 1}: ${pathText}`,
      text: `Ford-Fulkerson chooses this s-t path in the residual graph. Its residual capacities are ${residuals.join(', ')}, so the bottleneck is ${bottleneck}.`,
      flows: cloneFlows(flows),
      activePath: augmentation.path,
      bottleneck,
      phase: 'Find bottleneck',
    });

    flows = applyAugmentation(flows, augmentation.path, bottleneck);

    steps.push({
      title: `Augment path ${index + 1}`,
      text:
        augmentation.path.some((pathEdge) => pathEdge.direction === 'backward')
          ? `Add ${bottleneck} unit along ${pathText}. The backward edge cancels flow on a-b, rerouting that unit through a-t instead.`
          : `Add ${bottleneck} unit along ${pathText}. Forward residual capacity shrinks, and backward residual capacity appears wherever flow can be canceled later.`,
      flows: cloneFlows(flows),
      activePath: [],
      bottleneck,
      phase: 'Augment',
    });
  });

  steps.push({
    title: 'No augmenting path remains',
    text: 'All remaining residual routes from s get blocked before t. The current flow is 3, which saturates every edge leaving s.',
    flows: cloneFlows(flows),
    activePath: [],
    bottleneck: null,
    phase: 'Complete',
  });

  return steps;
}

const steps = buildSteps();

function getQuadraticPoint(start, control, end, t) {
  const inverse = 1 - t;

  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
}

function getQuadraticTangent(start, control, end, t) {
  return {
    x: 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x),
    y: 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y),
  };
}

function getEdgeGeometry(edge, reversed = false) {
  const curveOffset = edge.id === 'a-b' ? -66 : -30;
  const from = nodeById[reversed ? edge.to : edge.from];
  const to = nodeById[reversed ? edge.from : edge.to];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const unitX = dx / length;
  const unitY = dy / length;
  const normalX = -unitY;
  const normalY = unitX;
  const start = {
    x: from.x + unitX * 20,
    y: from.y + unitY * 20,
  };
  const end = {
    x: to.x - unitX * 22,
    y: to.y - unitY * 22,
  };
  const control = {
    x: (start.x + end.x) / 2 + normalX * curveOffset,
    y: (start.y + end.y) / 2 + normalY * curveOffset,
  };
  const label = getQuadraticPoint(start, control, end, 0.5);
  const arrowPoint = getQuadraticPoint(start, control, end, 0.78);
  const tangent = getQuadraticTangent(start, control, end, 0.78);
  const path = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

  return {start, end, control, label, arrowPoint, tangent, path};
}

function getArrowPoints(geometry, size = 13) {
  const length = Math.hypot(geometry.tangent.x, geometry.tangent.y);
  const unitX = geometry.tangent.x / length;
  const unitY = geometry.tangent.y / length;
  const normalX = -unitY;
  const normalY = unitX;
  const base = {
    x: geometry.arrowPoint.x - unitX * size,
    y: geometry.arrowPoint.y - unitY * size,
  };

  return [
    `${geometry.arrowPoint.x},${geometry.arrowPoint.y}`,
    `${base.x + normalX * (size * 0.56)},${base.y + normalY * (size * 0.56)}`,
    `${base.x - normalX * (size * 0.56)},${base.y - normalY * (size * 0.56)}`,
  ].join(' ');
}

function getActivePathIds(activePath) {
  return new Set(activePath.map((pathEdge) => `${pathEdge.edgeId}:${pathEdge.direction}`));
}

function NetworkGraph({step}) {
  const activePathIds = useMemo(() => getActivePathIds(step.activePath), [step.activePath]);
  const activeNodes = useMemo(() => new Set(getPathNodes(step.activePath)), [step.activePath]);
  const hasActivePath = step.activePath.length > 0;

  return (
    <svg className={styles.graph} viewBox="0 0 600 300" role="img" aria-label="Flow network residual graph">
      <g>
        {edges.map((edge) => {
          const geometry = getEdgeGeometry(edge);
          const flow = step.flows[edge.id];
          const isActiveForward = activePathIds.has(`${edge.id}:forward`);
          const isMuted = hasActivePath && !isActiveForward;

          return (
            <g key={edge.id}>
              <path
                className={clsx(
                  styles.edge,
                  flow > 0 && !hasActivePath && styles.flowingEdge,
                  isActiveForward && styles.activeEdge,
                  isMuted && styles.mutedEdge,
                )}
                d={geometry.path}
              />
              <rect
                className={clsx(
                  styles.edgeLabel,
                  isActiveForward && styles.activeLabel,
                  isMuted && styles.mutedLabel,
                )}
                x={geometry.label.x - 29}
                y={geometry.label.y - 12}
                width="58"
                height="24"
                rx="4"
              />
              <text
                className={clsx(styles.edgeText, isMuted && styles.mutedText)}
                x={geometry.label.x}
                y={geometry.label.y + 4}>
                {flow}/{edge.capacity}
              </text>
            </g>
          );
        })}
      </g>

      <g>
        {edges.map((edge) => {
          const flow = step.flows[edge.id];

          if (flow <= 0) {
            return null;
          }

          const geometry = getEdgeGeometry(edge, true);
          const isActiveBackward = activePathIds.has(`${edge.id}:backward`);
          const isMuted = hasActivePath && !isActiveBackward;
          const backwardFlow = edge.capacity - flow;

          return (
            <g key={`${edge.id}-back`}>
              <path
                className={clsx(
                  styles.residualEdge,
                  isActiveBackward && styles.activeResidualEdge,
                  isMuted && styles.mutedEdge,
                )}
                d={geometry.path}
              />
              <rect
                className={clsx(
                  styles.residualBadge,
                  isActiveBackward && styles.activeResidualBadge,
                  isMuted && styles.mutedLabel,
                )}
                x={geometry.label.x - 26}
                y={geometry.label.y - 11}
                width="52"
                height="22"
                rx="4"
              />
              <text
                className={clsx(styles.residualBadgeText, isMuted && styles.mutedText)}
                x={geometry.label.x}
                y={geometry.label.y + 4}>
                {backwardFlow}/{edge.capacity}
              </text>
            </g>
          );
        })}
      </g>

      <g className={styles.arrowLayer} aria-hidden="true">
        {edges.map((edge) => {
          const geometry = getEdgeGeometry(edge);
          const flow = step.flows[edge.id];
          const isActiveForward = activePathIds.has(`${edge.id}:forward`);
          const isMuted = hasActivePath && !isActiveForward;

          return (
            <polygon
              className={clsx(
                styles.edgeArrow,
                flow > 0 && !hasActivePath && styles.flowArrow,
                isActiveForward && styles.activeArrow,
                isMuted && styles.mutedArrow,
              )}
              key={`${edge.id}-arrow`}
              points={getArrowPoints(geometry)}
            />
          );
        })}
        {edges.map((edge) => {
          if (step.flows[edge.id] <= 0) {
            return null;
          }

          const geometry = getEdgeGeometry(edge, true);
          const isActiveBackward = activePathIds.has(`${edge.id}:backward`);
          const isMuted = hasActivePath && !isActiveBackward;

          return (
            <polygon
              className={clsx(
                styles.residualArrow,
                isActiveBackward && styles.activeArrow,
                isMuted && styles.mutedArrow,
              )}
              key={`${edge.id}-back-arrow`}
              points={getArrowPoints(geometry)}
            />
          );
        })}
      </g>

      <g>
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              className={clsx(styles.node, activeNodes.has(node.id) && styles.activeNode)}
              cx={node.x}
              cy={node.y}
              r="18"
            />
            <text className={styles.nodeLabel} x={node.x} y={node.y}>
              {node.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function FlowNetworkVisualizer() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const totalFlow = getTotalFlow(step.flows);

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const goForward = () => setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  const reset = () => setStepIndex(0);

  return (
    <div className={styles.visualizer}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Ford-Fulkerson Visualizer</p>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </div>
        <div className={styles.totalFlow}>
          <span>Total flow</span>
          <strong>{totalFlow}</strong>
        </div>
      </div>

      <div className={styles.stepRail} aria-label="Ford-Fulkerson steps">
        {steps.map((item, index) => (
          <button
            className={clsx(index === stepIndex && styles.stepDotActive)}
            key={`${item.phase}-${index}`}
            type="button"
            onClick={() => setStepIndex(index)}
            aria-label={`Go to step ${index + 1}: ${item.phase}`}>
            <span>{index + 1}</span>
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <NetworkGraph step={step} />
      </div>

      <div className={styles.footer}>
        <div className={styles.legend} aria-label="Legend">
          <span>
            <i className={styles.legendFlow} /> flow
          </span>
          <span>
            <i className={styles.legendActive} /> active path
          </span>
          <span>
            <i className={styles.legendResidual} /> residual back edge
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
