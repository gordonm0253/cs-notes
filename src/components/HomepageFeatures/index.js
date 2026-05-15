import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Stable Matching',
    description: (
      <>
        
      </>
    ),
  },
  {
    title: 'Greedy Algorithms',
    description: (
      <>
        
      </>
    ),
  },
  {
    title: 'Dynamic Programming',
    description: (
      <>
        
      </>
    ),
  },
  {
    title: 'Divide and Conquer',
    description: (
      <>
        
      </>
    ),
  },
  {
    title: 'NP-Completeness',
    description: (
      <>
        
      </>
    ),
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
