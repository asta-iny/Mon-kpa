# LibFind API — Docker build validation (modular monolith)
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/config/package.json packages/config/
COPY packages/validation/package.json packages/validation/
COPY prisma prisma
COPY tsconfig.base.json tsconfig.json ./
COPY packages packages
COPY apps/api apps/api

RUN npm install \
  && npx prisma generate --schema=prisma/schema.prisma \
  && npm run build -w @libfind/shared-types \
  && npm run build -w @libfind/config \
  && npm run build -w @libfind/validation \
  && npm run build -w @libfind/api

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
