FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js", "--http"]
