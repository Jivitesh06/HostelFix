require('dotenv').config();

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`[Config] Missing required environment variable: ${key}`);
    console.error('[Config] Copy server/.env.example to server/.env and fill in all values.');
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminRegistrationKey: process.env.ADMIN_REGISTRATION_KEY || 'HostelFix@Admin2026',
};
