const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3000',
  'http://localhost:3001'
];

const buildCorsOptions = ({ corsOrigin, allowedOrigins = DEFAULT_ALLOWED_ORIGINS }) => {
  const origins = [...allowedOrigins];

  if (corsOrigin) {
    const envOrigins = corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
    origins.push(...envOrigins);
  }

  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const matchesExactOrigin = origins.includes(origin);
      const matchesVercel = origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com');

      if (matchesExactOrigin || matchesVercel) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
};

module.exports = {
  buildCorsOptions,
  DEFAULT_ALLOWED_ORIGINS
};
