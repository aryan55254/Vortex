#stage 1 : builder

FROM node:20-slim AS builder 

WORKDIR  /app

COPY package*.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

#stage 2 : runner 

FROM node:20-slim 

WORKDIR /app

RUN apt-get update  && \
    apt-get install -y ffmpeg  &&\
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p temp/uploads temp/processed

EXPOSE 8080

CMD ["node" , "dist/http-server.js"]