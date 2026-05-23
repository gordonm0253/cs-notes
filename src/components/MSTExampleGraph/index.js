import styles from './styles.module.css';

const nodes = {
  A: {x: 120, y: 100},
  B: {x: 330, y: 70},
  C: {x: 260, y: 280},
  D: {x: 540, y: 260},
};

const edges = [
  {from: 'A', to: 'B', weight: 1},
  {from: 'A', to: 'C', weight: 3},
  {from: 'B', to: 'C', weight: 2},
  {from: 'B', to: 'D', weight: 4},
  {from: 'C', to: 'D', weight: 5},
];

function midpoint(start, end) {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

export default function MSTExampleGraph() {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.graph}
        viewBox="0 0 660 360"
        role="img"
        aria-labelledby="mst-example-title mst-example-description">
        <title id="mst-example-title">Weighted graph example</title>
        <desc id="mst-example-description">
          A weighted graph on vertices A, B, C, and D with edge weights 1, 2,
          3, 4, and 5.
        </desc>
        {edges.map((edge) => {
          const start = nodes[edge.from];
          const end = nodes[edge.to];
          const label = midpoint(start, end);

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                className={styles.edge}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
              />
              <circle className={styles.weightHalo} cx={label.x} cy={label.y} r="22" />
              <text className={styles.weight} x={label.x} y={label.y}>
                {edge.weight}
              </text>
            </g>
          );
        })}
        {Object.entries(nodes).map(([label, node]) => (
          <g key={label}>
            <circle className={styles.node} cx={node.x} cy={node.y} r="34" />
            <text className={styles.nodeLabel} x={node.x} y={node.y}>
              {label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
