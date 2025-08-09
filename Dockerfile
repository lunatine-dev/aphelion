FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create group and user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy package files first to leverage cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies as root (default user)
RUN pnpm install --frozen-lockfile --prod

# Copy app source
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

CMD ["pnpm", "start"]