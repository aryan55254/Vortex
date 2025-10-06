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
    MAX_VIDEO_DURATION_SECONDS: parseInt(getEnvVariable('MAX_VIDEO_DURATION_SECONDS'), 10),
    GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnvVariable('GOOGLE_CLIENT_SECRET'),
    GITHUB_CLIENT_ID: getEnvVariable('GITHUB_CLIENT_ID'),
    GITHUB_CLIENT_SECRET: getEnvVariable('GITHUB_CLIENT_SECRET'),
};

