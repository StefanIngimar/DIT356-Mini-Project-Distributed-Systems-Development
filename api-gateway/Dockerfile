FROM node:20-alpine AS base 

FROM base AS devbuild 
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install --production=false
RUN npm ci  
COPY . .

FROM base AS dev 
ENV NODE_ENV=development
WORKDIR /app
COPY --from=devbuild /app .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS test 
ENV NODE_ENV=test
WORKDIR /app
COPY --from=devbuild /app .
EXPOSE 3000
CMD ["npm", "run", "test"]

FROM base AS prodbuild 
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install --production 
RUN npm ci --omit=dev --no-audit
COPY . .

FROM base AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prodbuild /app .
EXPOSE 3000
CMD ["npm", "run", "start"]