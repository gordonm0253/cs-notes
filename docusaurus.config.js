// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CS Notes',
  tagline: 'Computer science notes for algorithms, theory, systems, and more.',
  favicon: 'img/algo.png',

  // Set the production url of your site here
  url: 'https://gordonm0253.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/cs-notes/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'gordonm0253', // Usually your GitHub org/user name.
  projectName: 'cs-notes', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/algo.png',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'CS Notes',
        logo: {
          alt: 'CS Notes Logo',
          src: 'img/algo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'CS4820 Notes',
          },
          {
            to: '/coming-soon',
            position: 'left',
            label: 'Coming Soon',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Topics',
            items: [
              {
                label: 'Stable Matching',
                to: '/docs/notes/stable-matching',
              },
              {
                label: 'Greedy Algorithms',
                to: '/docs/notes/greedy-algorithms',
              },
              {
                label: 'Dynamic Programming',
                to: '/docs/notes/dynamic-programming',
              },
              {
                label: 'Divide and Conquer',
                to: '/docs/notes/divide-and-conquer',
              },
            ],
          },
          {
            title: 'More Topics',
            items: [
              {
                label: 'Network Flow',
                to: '/docs/notes/network-flow',
              },
              {
                label: 'NP-Completeness',
                to: '/docs/notes/np-completeness',
              },
              {
                label: 'Approximation Algorithms',
                to: '/docs/notes/approximation-algorithms',
              },
              {
                label: 'Computability',
                to: '/docs/notes/computability',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CS Notes. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
