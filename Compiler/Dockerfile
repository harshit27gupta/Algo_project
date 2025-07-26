FROM node:18

WORKDIR /app
RUN apt-get update && apt-get install -y openjdk-17-jdk gcc g++ curl
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["npm", "start"] 