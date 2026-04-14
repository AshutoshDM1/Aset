# syntax=docker/dockerfile:1

FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
# Skip prepare (husky); Git hooks are not used inside the image
RUN bun install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# prisma generate does not need a real database
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
RUN bunx prisma generate

RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/src/generated/prisma ./src/generated/prisma

EXPOSE 5000

CMD ["bun", "run", "dist/index.js"]
