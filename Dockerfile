FROM node:22

# Create group and user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

RUN mkdir -p node_modules && chown appuser:appuser node_modules

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies as root (default user)
RUN npm install --omit=dev

# Copy app source
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

CMD ["npm", "run", "start"]
