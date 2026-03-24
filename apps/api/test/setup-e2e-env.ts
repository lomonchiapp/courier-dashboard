/**
 * Valores mínimos para que ConfigModule/Joi pasen al cargar AppModule en e2e.
 * Para ejecutar de verdad: define DATABASE_URL y JWT_SECRET reales en el entorno.
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-dev-secret-must-be-32-chars-min";
process.env.API_KEY_PEPPER = process.env.API_KEY_PEPPER || "e2e-dev-pepper-16chars-min";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/blumbox_api_e2e?schema=public";
