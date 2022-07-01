// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
// baseUrl: the name of the repository
// url: after your githup name .github.io
// github user or organization that own the repository
// projectName: the name of the githuo repository
// please see the link: https://docusaurus.io/docs/deployment
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SLIC Starter',
  tagline:
    'SLIC Starter is a complete starter project for production-grade serverless applications on AWS.',
  url: 'https://fourTheorem.github.io',
  baseUrl: '/slic-starter/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'fourTheorem', // Usually your GitHub org/user name.
  projectName: 'slic-starter', // Usually your repo name.
  trailingSlash: false,

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/fourTheorem/slic-starter/tree/main'
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/fourTheorem/slic-starter/tree/main'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'SLIC STARTER',
        logo: {
          alt: ' ',
          src: 'docusaurus.jpng'
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs'
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs/intro'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus'
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus'
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
