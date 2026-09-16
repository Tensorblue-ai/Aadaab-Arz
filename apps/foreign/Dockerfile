FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npx", "vinext", "start", "--hostname", "0.0.0.0", "--port", "3000"]
