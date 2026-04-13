const dns = require('dns');

const DEFAULT_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];

const parseDnsServers = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const configureMongoDns = ({ mongoUri, dnsServers = process.env.MONGODB_DNS_SERVERS } = {}) => {
  if (typeof mongoUri !== 'string' || !mongoUri.startsWith('mongodb+srv://')) {
    return [];
  }

  if (String(dnsServers || '').trim().toLowerCase() === 'system') {
    return [];
  }

  const servers = parseDnsServers(dnsServers);
  const effectiveServers = servers.length > 0 ? servers : DEFAULT_DNS_SERVERS;
  dns.setServers(effectiveServers);
  return effectiveServers;
};

module.exports = {
  configureMongoDns
};
