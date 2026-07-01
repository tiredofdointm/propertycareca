# syntax=docker/dockerfile:1

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not
# read at container startup — setting them on the Cloud Run *service* has no
# effect on already-built pages. They must be passed as build args instead.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID
ARG NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD
ARG NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING
ARG NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=${NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}
ENV NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD=${NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD}
ENV NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING=${NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING}
ENV NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT=${NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT}

RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
