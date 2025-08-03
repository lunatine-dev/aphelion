FROM node:22

# Create group and user
RUN groupadd -r aphelion && useradd -r -g aphelion aphelion

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies as root (default user)
RUN npm install --omit=dev

# Copy app source
COPY --chown=aphelion:aphelion . .

# Switch to non-root user
USER aphelion

CMD ["npm", "run", "start"]
