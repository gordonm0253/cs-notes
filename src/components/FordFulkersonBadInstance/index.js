import styles from './styles.module.css';

const C = 1000;

const nodes = {
  s: {x: 90, y: 150},
  a: {x: 300, y: 70},
  b: {x: 300, y: 230},
  t: {x: 510, y: 150},
};

const edges = [
  {id: 's-a', from: 's', to: 'a', capacity: C, curve: -18},
  {id: 's-b', from: 's', to: 'b', capacity: C, curve: 18},
  {id: 'a-b', from: 'a', to: 'b', capacity: 1, curve: 0, bottleneck: true},
  {id: 'a-t', from: 'a', to: 't', capacity: C, curve: -18},
  {id: 'b-t', from: 'b', to: 't', capacity: C, curve: 18},
];

function getEdgeGeometry(edge) {
  const from = nodes[edge.from];
  const to = nodes[edge.to];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const unitX = dx / length;
  const unitY = dy / length;
  const normalX = -unitY;
  const normalY = unitX;
  const start = {x: from.x + unitX * 22, y: from.y + unitY * 22};
  const end = {x: to.x - unitX * 24, y: to.y - unitY * 24};
  const control = {
    x: (start.x + end.x) / 2 + normalX * edge.curve,
    y: (start.y + end.y) / 2 + normalY * edge.curve,
  };
  const label = {
    x: (start.x + end.x + control.x) / 3,
    y: (start.y + end.y + control.y) / 3,
  };

  return {start, end, control, label};
}

export default function FordFulkersonBadInstance() {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.graph}
        viewBox="0 0 600 300"
        role="img"
        aria-labelledby="ff-bad-instance-title ff-bad-instance-description">
        <title id="ff-bad-instance-title">Ford-Fulkerson bad instance</title>
        <desc id="ff-bad-instance-description">
          A flow network on nodes s, a, b, and t where s-a, s-b, a-t, and b-t
          all have capacity {C}, but the internal edge a-b has capacity 1.
        </desc>
        <defs>
          <marker id="ff-bad-arrow" markerHeight="9" markerWidth="9" orient="auto" refX="7" refY="4.5">
            <path d="M0,0 L9,4.5 L0,9 Z" className={styles.arrowHead} />
          </marker>
          <marker id="ff-bad-arrow-bottleneck" markerHeight="9" markerWidth="9" orient="auto" refX="7" refY="4.5">
            <path d="M0,0 L9,4.5 L0,9 Z" className={styles.bottleneckArrowHead} />
          </marker>
        </defs>

        {edges.map((edge) => {
          const geometry = getEdgeGeometry(edge);

          return (
            <g key={edge.id}>
              <path
                className={edge.bottleneck ? styles.bottleneckEdge : styles.edge}
                d={`M ${geometry.start.x} ${geometry.start.y} Q ${geometry.control.x} ${geometry.control.y} ${geometry.end.x} ${geometry.end.y}`}
                markerEnd={edge.bottleneck ? 'url(#ff-bad-arrow-bottleneck)' : 'url(#ff-bad-arrow)'}
              />
              <rect
                className={edge.bottleneck ? styles.bottleneckBadge : styles.capacityBadge}
                x={geometry.label.x - 24}
                y={geometry.label.y - 13}
                width="48"
                height="26"
                rx="4"
              />
              <text
                className={edge.bottleneck ? styles.bottleneckText : styles.capacityText}
                x={geometry.label.x}
                y={geometry.label.y + 5}>
                {edge.capacity}
              </text>
            </g>
          );
        })}

        {Object.entries(nodes).map(([label, node]) => (
          <g key={label}>
            <circle className={styles.node} cx={node.x} cy={node.y} r="22" />
            <text className={styles.nodeLabel} x={node.x} y={node.y + 6}>
              {label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className={styles.caption}>
        Every edge has capacity {C} except <strong>a&#8209;b</strong>, whose capacity is 1. An
        unlucky sequence of augmenting paths that keeps crossing a&#8209;b (forward, then
        backward to cancel it) makes Ford-Fulkerson take {2 * C} iterations, even though the
        max flow of {2 * C} could be reached in just 2.
      </figcaption>
    </figure>
  );
}
