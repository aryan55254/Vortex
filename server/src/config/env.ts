import 'dotenv/config'

function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing or invalid environment variable: ${key}`);
    }
    return value;
}
export const env = {
    PORT: parseInt(getEnvVariable('PORT'), 10),
    SERVER_URL: getEnvVariable('SERVER_URL'),
    MONGO_URI: getEnvVariable('MONGO_URI'),
    SESSION_SECRET: getEnvVariable('SESSION_SECRET'),
    GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnvVariable('GOOGLE_CLIENT_SECRET'),
    NODE_ENV: getEnvVariable('NODE_ENV'),
};

