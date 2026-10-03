FROM node:20-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# BASE_API_URL is inlined into the client bundle at build time (next.config env).
# "/v1" is relative to the ALB host, so it works on http or https and on any domain - no rebuild needed.
ARG BASE_API_URL=/v1
ENV BASE_API_URL=$BASE_API_URL
RUN yarn build
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["yarn", "start"]