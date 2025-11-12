import { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "ICJIA Accessibility Status Portal",
  tagline: "Comprehensive web accessibility tracking system for ICJIA",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.NODE_ENV === "production" ? "/docs/" : "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "ICJIA",
  projectName: "icjia-accessibility-status",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/ICJIA/icjia-accessibility-status/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "ICJIA Accessibility Portal",
      logo: {
        alt: "ICJIA Logo",
        src: "img/icjia-logo.png",
        width: 40,
        height: 40,
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
          label: "← Back to App",
          position: "right",
          target: "_self",
        },
        {
          href: "https://github.com/ICJIA/icjia-accessibility-status",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Quick Start",
              to: "docs/quick-start",
            },
            {
              label: "Setup Guide",
              to: "docs/setup-guide",
            },
            {
              label: "API Documentation",
              to: "docs/api/overview",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/ICJIA/icjia-accessibility-status",
            },
            {
              label: "Issues",
              href: "https://github.com/ICJIA/icjia-accessibility-status/issues",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "ICJIA Website",
              href: "https://www.icjia.state.il.us",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Illinois Criminal Justice Information Authority. Built with Docusaurus.`,
    },
    prism: {
      theme: require("prism-react-renderer").themes.nightOwl,
      darkTheme: require("prism-react-renderer").themes.nightOwl,
      additionalLanguages: ["bash", "typescript", "sql", "json"],
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
