FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create output directory
RUN mkdir -p /app/output

VOLUME ["/app/output"]

CMD ["node", "index.js"]

