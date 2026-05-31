import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Stable Matching',
    description: <>Gale-Shapley algorithm, proofs of stability and optimality. </>,
  },
  {
    title: 'Greedy Algorithms',
    description: <>Interval scheduling, minimum spanning tree (Kruskal's, Prim's). Exchange arguments and greedy-stays-ahead proofs.</>,
  },
  {
    title: 'Dynamic Programming',
    description: <>Top-down, bottom-up styles. Bellman Ford, Segmented Least Squares</>,
  },
  {
    title: 'Divide and Conquer',
    description: <>Fast Fourier Transform, randomized median finding. Recurrences and the Master Theorem.</>,
  },
  {
    title: 'Network Flow',
    description: <>Ford-Fulkerson, max-flow min-cut theorem, bipartite matching, and reductions.</>,
  },
  {
    title: 'NP-Completeness',
    description: <>P vs. NP, polynomial-time reductions, NP-hard and NP-complete problems.</>,
  },
];


function Feature({title, description}) {
  return (
    <div className={clsx('col col--4', styles.featureColumn)}>
      <div className={styles.featureCard}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
