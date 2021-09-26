FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy the project
COPY . .

# Compile the library and link the library
RUN npm install && npm run compile && npm prune --production 

EXPOSE 8080

# Run the application
WORKDIR /usr/src/app
CMD ["node", "./dist/index.js"]

