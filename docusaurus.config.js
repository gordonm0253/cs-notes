// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CS4820 Algorithms Notes',
  tagline: 'Course notes for stable matching, greedy algorithms, dynamic programming, divide and conquer, and NP-completeness.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://gordonm0253.github.io/cs-notes/',
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
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'CS4820 Notes',
        logo: {
          alt: 'CS4820 Algorithms Notes Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Notes',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Notes',
                to: '/docs/intro',
              },
            ],
          },
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
            ],
          },
          {
            title: 'Reference',
            items: [
              {
                label: 'Docusaurus Tutorial',
                to: '/docs/tutorial-basics/create-a-document',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CS4820 Algorithms Notes. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
