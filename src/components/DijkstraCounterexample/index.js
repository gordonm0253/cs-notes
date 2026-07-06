import styles from './styles.module.css';

const nodes = {
  S: {x: 70, y: 105},
  A: {x: 230, y: 55},
  B: {x: 230, y: 155},
};

const edges = [
  {from: 'S', to: 'A', weight: 2},
  {from: 'S', to: 'B', weight: 5},
  {from: 'A', to: 'B', weight: -4, negative: true},
];

function midpoint(edge) {
  const startNode = nodes[edge.from];
  const endNode = nodes[edge.to];

  return {
    x: (startNode.x + endNode.x) / 2,
    y: (startNode.y + endNode.y) / 2,
  };
}

export default function DijkstraCounterexample() {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.graph}
        viewBox="0 0 300 220"
        role="img"
        aria-labelledby="dijkstra-counterexample-title dijkstra-counterexample-description">
        <title id="dijkstra-counterexample-title">Dijkstra counterexample with a negative edge</title>
        <desc id="dijkstra-counterexample-description">
          Undirected graph with edges S A weight 2, S B weight 5, and A B weight negative 4.
        </desc>
        {edges.map((edge) => {
          const start = nodes[edge.from];
          const end = nodes[edge.to];
          const label = midpoint(edge);

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                className={edge.negative ? styles.negativeEdge : styles.edge}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
              />
              <circle className={styles.weightHalo} cx={label.x} cy={label.y} r="14" />
              <text className={styles.weight} x={label.x} y={label.y}>
                {edge.weight}
              </text>
            </g>
          );
        })}
        {Object.entries(nodes).map(([label, node]) => (
          <g key={label}>
            <circle className={styles.node} cx={node.x} cy={node.y} r="20" />
            <text className={styles.nodeLabel} x={node.x} y={node.y}>
              {label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
