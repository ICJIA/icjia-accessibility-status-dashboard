import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '677'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'd3e'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'be6'),
            routes: [
              {
                path: '/docs/api/api-keys',
                component: ComponentCreator('/docs/api/api-keys', 'a89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/authentication',
                component: ComponentCreator('/docs/api/authentication', '733'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/overview',
                component: ComponentCreator('/docs/api/overview', '211'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/sites',
                component: ComponentCreator('/docs/api/sites', 'd6c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/architecture',
                component: ComponentCreator('/docs/architecture', '4b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/authentication',
                component: ComponentCreator('/docs/authentication', '938'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/configuration/env-configuration',
                component: ComponentCreator('/docs/configuration/env-configuration', '513'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/configuration/env-sample-audit',
                component: ComponentCreator('/docs/configuration/env-sample-audit', 'af1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/database-schema',
                component: ComponentCreator('/docs/database-schema', '1d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/automated-deployment',
                component: ComponentCreator('/docs/deployment/automated-deployment', '662'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/automated-deployment-complete',
                component: ComponentCreator('/docs/deployment/automated-deployment-complete', 'c6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/automated-deployment-setup',
                component: ComponentCreator('/docs/deployment/automated-deployment-setup', 'c67'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/coolify-deployment',
                component: ComponentCreator('/docs/deployment/coolify-deployment', '20a'),
                exact: true
              },
              {
                path: '/docs/deployment/database-backups',
                component: ComponentCreator('/docs/deployment/database-backups', '8e1'),
                exact: true
              },
              {
                path: '/docs/deployment/deployment-complete',
                component: ComponentCreator('/docs/deployment/deployment-complete', 'f79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/deployment-flow',
                component: ComponentCreator('/docs/deployment/deployment-flow', '26b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/deployment-scripts-reference',
                component: ComponentCreator('/docs/deployment/deployment-scripts-reference', '1d9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/deployment-verification',
                component: ComponentCreator('/docs/deployment/deployment-verification', 'e49'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/docusaurus-deployment',
                component: ComponentCreator('/docs/deployment/docusaurus-deployment', '870'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/environment-verification',
                component: ComponentCreator('/docs/deployment/environment-verification', '057'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/forge-checklist',
                component: ComponentCreator('/docs/deployment/forge-checklist', '4ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/forge-deployment-script',
                component: ComponentCreator('/docs/deployment/forge-deployment-script', '9f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/forge-quick-start',
                component: ComponentCreator('/docs/deployment/forge-quick-start', '364'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/forge-script-setup',
                component: ComponentCreator('/docs/deployment/forge-script-setup', '629'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/health-check-monitoring',
                component: ComponentCreator('/docs/deployment/health-check-monitoring', '4f3'),
                exact: true
              },
              {
                path: '/docs/deployment/laravel-forge',
                component: ComponentCreator('/docs/deployment/laravel-forge', '2e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/nginx',
                component: ComponentCreator('/docs/deployment/nginx', '361'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/overview',
                component: ComponentCreator('/docs/deployment/overview', 'ac9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/pm2',
                component: ComponentCreator('/docs/deployment/pm2', 'fad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/pm2-ecosystem-config',
                component: ComponentCreator('/docs/deployment/pm2-ecosystem-config', '56b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/pm2-environment-variables',
                component: ComponentCreator('/docs/deployment/pm2-environment-variables', 'fdf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/pm2-verification',
                component: ComponentCreator('/docs/deployment/pm2-verification', '583'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/production',
                component: ComponentCreator('/docs/deployment/production', 'b2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/deployment/verification-report',
                component: ComponentCreator('/docs/deployment/verification-report', '6f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/development-setup',
                component: ComponentCreator('/docs/development-setup', '457'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/quick-start',
                component: ComponentCreator('/docs/quick-start', 'b74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/reset-scripts',
                component: ComponentCreator('/docs/reset-scripts', '299'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/security/audit-overview',
                component: ComponentCreator('/docs/security/audit-overview', '365'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/security/complete-audit-report',
                component: ComponentCreator('/docs/security/complete-audit-report', 'e46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/security/critical-issues-fixed',
                component: ComponentCreator('/docs/security/critical-issues-fixed', '9df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/security/minor-issues-fixed',
                component: ComponentCreator('/docs/security/minor-issues-fixed', 'd1a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/security/security-findings',
                component: ComponentCreator('/docs/security/security-findings', 'f93'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/setup-guide',
                component: ComponentCreator('/docs/setup-guide', '419'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/setup/monorepo-setup',
                component: ComponentCreator('/docs/setup/monorepo-setup', '16e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/testing',
                component: ComponentCreator('/docs/testing', 'f86'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/authentication-errors',
                component: ComponentCreator('/docs/troubleshooting/authentication-errors', '586'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/common-issues',
                component: ComponentCreator('/docs/troubleshooting/common-issues', '944'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/database-errors',
                component: ComponentCreator('/docs/troubleshooting/database-errors', 'b8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
