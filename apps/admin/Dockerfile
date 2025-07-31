FROM oven/bun:alpine AS runner
WORKDIR /app

COPY .next .next
COPY public public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", ".next/standalone/apps/admin/server.js"]
