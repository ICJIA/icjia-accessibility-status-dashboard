import type { SidebarsConfig } from "@docusaurus/types";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "category",
      label: "🚀 Getting Started",
      items: ["intro", "quick-start", "setup-guide"],
    },
    {
      type: "category",
      label: "🏗️ Core Concepts",
      items: ["authentication", "database-schema", "architecture"],
    },
    {
      type: "category",
      label: "💻 Development",
      items: ["development-setup", "reset-scripts", "testing"],
    },
    {
      type: "category",
      label: "⚙️ Configuration",
      items: [
        "configuration/env-sample-audit",
        "configuration/env-configuration",
      ],
    },
    {
      type: "category",
      label: "🔌 API Reference",
      items: [
        "api/overview",
        "api/authentication",
        "api/sites",
        "api/api-keys",
      ],
    },
    {
      type: "category",
      label: "🚀 Setup & Infrastructure",
      items: ["setup/monorepo-setup"],
    },
    {
      type: "category",
      label: "🚢 Deployment",
      items: [
        "deployment/overview",
        "deployment/environment-verification",
        "deployment/laravel-forge",
        "deployment/automated-deployment-setup",
        "deployment/forge-deployment-script",
        "deployment/deployment-scripts-reference",
        "deployment/production",
        "deployment/nginx",
        "deployment/pm2",
        "deployment/pm2-environment-variables",
        "deployment/pm2-ecosystem-config",
        "deployment/pm2-verification",
        "deployment/automated-deployment",
        "deployment/automated-deployment-complete",
        "deployment/deployment-verification",
        "deployment/forge-quick-start",
        "deployment/forge-checklist",
        "deployment/deployment-complete",
        "deployment/deployment-flow",
        "deployment/docusaurus-deployment",
        "deployment/forge-script-setup",
        "deployment/verification-report",
        "deployment/docker-audit-report",
      ],
    },
    {
      type: "category",
      label: "🔒 Security & Audits",
      items: [
        "security/audit-overview",
        "security/complete-audit-report",
        "security/security-findings",
        "security/critical-issues-fixed",
        "security/minor-issues-fixed",
      ],
    },
    {
      type: "category",
      label: "🔧 Troubleshooting",
      items: [
        "troubleshooting/common-issues",
        "troubleshooting/authentication-errors",
        "troubleshooting/database-errors",
      ],
    },
  ],
};

export default sidebars;
