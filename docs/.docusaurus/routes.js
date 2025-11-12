import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs/docs',
    component: ComponentCreator('/docs/docs', '316'),
    routes: [
      {
        path: '/docs/docs',
        component: ComponentCreator('/docs/docs', '33b'),
        routes: [
          {
            path: '/docs/docs',
            component: ComponentCreator('/docs/docs', 'efb'),
            routes: [
              {
                path: '/docs/docs/api/api-keys',
                component: ComponentCreator('/docs/docs/api/api-keys', '47a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/api/authentication',
                component: ComponentCreator('/docs/docs/api/authentication', '13e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/api/overview',
                component: ComponentCreator('/docs/docs/api/overview', '0ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/api/sites',
                component: ComponentCreator('/docs/docs/api/sites', '6a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/architecture',
                component: ComponentCreator('/docs/docs/architecture', 'e8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/authentication',
                component: ComponentCreator('/docs/docs/authentication', '8bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/configuration/env-configuration',
                component: ComponentCreator('/docs/docs/configuration/env-configuration', '701'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/configuration/env-sample-audit',
                component: ComponentCreator('/docs/docs/configuration/env-sample-audit', '3a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/database-schema',
                component: ComponentCreator('/docs/docs/database-schema', '4ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/automated-deployment',
                component: ComponentCreator('/docs/docs/deployment/automated-deployment', 'b5a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/automated-deployment-complete',
                component: ComponentCreator('/docs/docs/deployment/automated-deployment-complete', 'c26'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/automated-deployment-setup',
                component: ComponentCreator('/docs/docs/deployment/automated-deployment-setup', 'b41'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/coolify-deployment',
                component: ComponentCreator('/docs/docs/deployment/coolify-deployment', '012'),
                exact: true
              },
              {
                path: '/docs/docs/deployment/database-backups',
                component: ComponentCreator('/docs/docs/deployment/database-backups', '598'),
                exact: true
              },
              {
                path: '/docs/docs/deployment/deployment-complete',
                component: ComponentCreator('/docs/docs/deployment/deployment-complete', '3f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/deployment-flow',
                component: ComponentCreator('/docs/docs/deployment/deployment-flow', '5e2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/deployment-scripts-reference',
                component: ComponentCreator('/docs/docs/deployment/deployment-scripts-reference', '92f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/deployment-verification',
                component: ComponentCreator('/docs/docs/deployment/deployment-verification', '88f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/docker-audit-report',
                component: ComponentCreator('/docs/docs/deployment/docker-audit-report', 'e85'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/docusaurus-deployment',
                component: ComponentCreator('/docs/docs/deployment/docusaurus-deployment', '018'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/environment-verification',
                component: ComponentCreator('/docs/docs/deployment/environment-verification', '561'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/forge-checklist',
                component: ComponentCreator('/docs/docs/deployment/forge-checklist', '325'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/forge-deployment-script',
                component: ComponentCreator('/docs/docs/deployment/forge-deployment-script', '204'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/forge-quick-start',
                component: ComponentCreator('/docs/docs/deployment/forge-quick-start', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/forge-script-setup',
                component: ComponentCreator('/docs/docs/deployment/forge-script-setup', 'fd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/health-check-monitoring',
                component: ComponentCreator('/docs/docs/deployment/health-check-monitoring', 'f94'),
                exact: true
              },
              {
                path: '/docs/docs/deployment/laravel-forge',
                component: ComponentCreator('/docs/docs/deployment/laravel-forge', 'fbc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/nginx',
                component: ComponentCreator('/docs/docs/deployment/nginx', '70d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/overview',
                component: ComponentCreator('/docs/docs/deployment/overview', 'fb0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/pm2',
                component: ComponentCreator('/docs/docs/deployment/pm2', '9b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/pm2-ecosystem-config',
                component: ComponentCreator('/docs/docs/deployment/pm2-ecosystem-config', '9c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/pm2-environment-variables',
                component: ComponentCreator('/docs/docs/deployment/pm2-environment-variables', '507'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/pm2-verification',
                component: ComponentCreator('/docs/docs/deployment/pm2-verification', '516'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/production',
                component: ComponentCreator('/docs/docs/deployment/production', 'a6f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/deployment/verification-report',
                component: ComponentCreator('/docs/docs/deployment/verification-report', '879'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/development-setup',
                component: ComponentCreator('/docs/docs/development-setup', '111'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/intro',
                component: ComponentCreator('/docs/docs/intro', '2ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/pm2',
                component: ComponentCreator('/docs/docs/pm2', '36d'),
                exact: true
              },
              {
                path: '/docs/docs/quick-start',
                component: ComponentCreator('/docs/docs/quick-start', '2bf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/reset-scripts',
                component: ComponentCreator('/docs/docs/reset-scripts', '6bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/security/',
                component: ComponentCreator('/docs/docs/security/', 'ea3'),
                exact: true
              },
              {
                path: '/docs/docs/security/audit-overview',
                component: ComponentCreator('/docs/docs/security/audit-overview', 'dc4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/security/complete-audit-report',
                component: ComponentCreator('/docs/docs/security/complete-audit-report', 'e59'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/security/critical-issues-fixed',
                component: ComponentCreator('/docs/docs/security/critical-issues-fixed', 'a55'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/security/minor-issues-fixed',
                component: ComponentCreator('/docs/docs/security/minor-issues-fixed', 'c4c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/security/security-findings',
                component: ComponentCreator('/docs/docs/security/security-findings', '1c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/setup-guide',
                component: ComponentCreator('/docs/docs/setup-guide', 'be6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/setup/monorepo-setup',
                component: ComponentCreator('/docs/docs/setup/monorepo-setup', 'a24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/testing',
                component: ComponentCreator('/docs/docs/testing', '17a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/troubleshooting/authentication-errors',
                component: ComponentCreator('/docs/docs/troubleshooting/authentication-errors', '1c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/troubleshooting/common-issues',
                component: ComponentCreator('/docs/docs/troubleshooting/common-issues', '1d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/docs/troubleshooting/database-errors',
                component: ComponentCreator('/docs/docs/troubleshooting/database-errors', '4e0'),
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
    path: '/docs/',
    component: ComponentCreator('/docs/', '2a6'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
