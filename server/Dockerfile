FROM node:18 AS builder 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg yt-dlp && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]