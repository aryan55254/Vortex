import 'dotenv/config';

function getEnvVariable(key: string, required: boolean = true): string {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing or invalid environment variable: ${key}`);
    }
    return value || '';
}

export const env = {
    // Core
    PORT: parseInt(getEnvVariable('PORT', false), 10) || 8080,
    NODE_ENV: getEnvVariable('NODE_ENV', false) || 'development',
    SERVER_URL: getEnvVariable('SERVER_URL'),
    CLIENT_URL: getEnvVariable('CLIENT_URL'),

    // Databases
    MONGO_URI: getEnvVariable('MONGO_URI'),

    // Redis
    REDIS_HOST: getEnvVariable('REDIS_HOST'),
    REDIS_PORT: parseInt(getEnvVariable('REDIS_PORT'), 10),
    REDIS_PASSWORD: getEnvVariable('REDIS_PASSWORD', false), 

    // Auth
    SESSION_SECRET: getEnvVariable('SESSION_SECRET'),
    GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnvVariable('GOOGLE_CLIENT_SECRET'),

    // S3
    S3_ENDPOINT: getEnvVariable('S3_ENDPOINT', false),
    S3_BUCKET: getEnvVariable('S3_BUCKET_NAME'),
    S3_ACCESS_KEY: getEnvVariable('S3_ACCESS_KEY'),
    S3_SECRET_KEY: getEnvVariable('S3_SECRET_KEY'),
    S3_REGION: getEnvVariable('S3_REGION'),
};