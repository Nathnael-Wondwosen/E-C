const ADMIN_SCOPES = Object.freeze([
  {
    id: 'local',
    name: 'Local Admin',
    description: 'Operates local market data and operations.',
    source: 'project-1'
  },
  {
    id: 'global',
    name: 'Global Admin',
    description: 'Operates cross-border global commerce data.',
    source: 'project-1'
  },
  {
    id: 'africa',
    name: 'Africa Admin',
    description: 'Operates Africa regional commerce and partners.',
    source: 'project-1'
  },
  {
    id: 'china',
    name: 'China Admin',
    description: 'Operates China-facing market and supplier channels.',
    source: 'project-1'
  },
  {
    id: 'b2b',
    name: 'B2B Admin',
    description: 'Operates B2B product and supplier workflows.',
    source: 'project-2'
  },
  {
    id: 'system',
    name: 'System Admin',
    description: 'Owns platform-wide controls, governance, and security.',
    source: 'project-2'
  }
]);

const DEFAULT_ADMIN_SCOPE = 'local';

const getAdminScopeById = (scopeId) =>
  ADMIN_SCOPES.find((scope) => scope.id === scopeId) ||
  ADMIN_SCOPES.find((scope) => scope.id === DEFAULT_ADMIN_SCOPE);

module.exports = {
  ADMIN_SCOPES,
  DEFAULT_ADMIN_SCOPE,
  getAdminScopeById
};
