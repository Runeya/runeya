FROM ghcr.io/runeya/docker/build-node-22:latest AS prune
WORKDIR /app
COPY . .
RUN yarn dlx turbo prune @runeya/fronts-docs --docker

FROM ghcr.io/runeya/docker/build-node-22:latest AS builder
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/.turbo/ .
COPY --from=prune /app/out/yarn.lock ./yarn.lock
COPY --from=prune /app/.yarn/cach[e] .yarn/cache
RUN yarn workspaces focus @runeya/fronts-docs
COPY --from=prune /app/out/full/ .
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN
RUN yarn dlx turbo run build --filter=@runeya/fronts-docs
RUN yarn workspaces focus -A --production

FROM ghcr.io/runeya/docker/base-node-22:latest AS prod
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runeya
USER runeya
COPY --from=builder --chown=runeya:nodejs /app .

CMD node node_modules/@runeya/fronts-docs/server.js
