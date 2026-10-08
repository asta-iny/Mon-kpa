# LibFind web — Docker build validation (static assets)
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/config/package.json packages/config/
COPY packages/validation/package.json packages/validation/
COPY tsconfig.base.json tsconfig.json ./
COPY packages/shared-types packages/shared-types
COPY apps/web apps/web

RUN npm install \
  && npm run build -w @libfind/shared-types \
  && npm run build -w @libfind/web

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
