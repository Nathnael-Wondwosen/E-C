const VALID_MARKET_SCOPES = new Set(['local', 'global', 'africa', 'china', 'b2b']);
const SCOPE_ALIASES = Object.freeze({
  ethiopia: 'local',
  regional: 'africa',
  worldwide: 'global',
  international: 'global'
});
const SCOPE_FIELDS = ['marketScope', 'scope', 'adminScope', 'regionScope'];

const normalizeScopeValue = (rawScope) => {
  if (!rawScope) return null;
  const normalized = `${rawScope}`.trim().toLowerCase();
  const mapped = SCOPE_ALIASES[normalized] || normalized;
  return VALID_MARKET_SCOPES.has(mapped) ? mapped : null;
};

const resolveRequestedScope = (req) => {
  const scopeFromQuery = req.query?.scope;
  const scopeFromHeader = req.headers['x-market-scope'] || req.headers['x-admin-scope'];
  const scopeFromBody = req.body?.marketScope || req.body?.scope;
  return normalizeScopeValue(scopeFromQuery || scopeFromHeader || scopeFromBody);
};

const buildScopedQuery = (requestedScope, baseQuery = {}) => {
  if (!requestedScope) return baseQuery;

  const scopeMatchClauses = SCOPE_FIELDS.map((field) => ({ [field]: requestedScope }));
  let scopeQuery = { $or: scopeMatchClauses };

  if (requestedScope === 'global') {
    const noScopeFields = {
      $and: SCOPE_FIELDS.map((field) => ({ [field]: { $exists: false } }))
    };
    scopeQuery = { $or: [...scopeMatchClauses, noScopeFields] };
  }

  if (!baseQuery || Object.keys(baseQuery).length === 0) {
    return scopeQuery;
  }

  return { $and: [baseQuery, scopeQuery] };
};

const applyMarketScopeToDocument = (req, payload = {}) => {
  const requestedScope = resolveRequestedScope(req);
  if (!requestedScope) {
    return payload;
  }

  return {
    ...payload,
    marketScope: normalizeScopeValue(payload.marketScope || payload.scope) || requestedScope
  };
};

const getDocumentScope = (doc) => {
  for (const field of SCOPE_FIELDS) {
    const normalized = normalizeScopeValue(doc?.[field]);
    if (normalized) return normalized;
  }
  return null;
};

const documentMatchesRequestedScope = (doc, requestedScope) => {
  if (!requestedScope) return true;
  const documentScope = getDocumentScope(doc);
  if (requestedScope === 'global') {
    return documentScope === 'global' || !documentScope;
  }
  return documentScope === requestedScope;
};

const ensureDocumentScopeAccess = (req, res, doc, resourceName = 'Resource') => {
  const requestedScope = resolveRequestedScope(req);
  if (!documentMatchesRequestedScope(doc, requestedScope)) {
    res.status(403).json({ error: `Forbidden: ${resourceName} is outside the active scope` });
    return false;
  }
  return true;
};

module.exports = {
  resolveRequestedScope,
  buildScopedQuery,
  applyMarketScopeToDocument,
  ensureDocumentScopeAccess
};
