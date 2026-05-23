import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './coming-soon.module.css';

export default function ComingSoon() {
  return (
    <Layout
      title="Coming Soon"
      description="A placeholder page for future CS notes.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Next up</p>
          <Heading as="h1">Coming Soon</Heading>
          <p className={styles.description}>
            More computer science notes will land here as new topics are added.
          </p>
        </section>
      </main>
    </Layout>
  );
}
