FROM node:20-alpine AS base 

FROM base AS devbuild 
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install --production=false
RUN npm ci  
COPY . .

FROM base AS dev 
ENV NODE_ENV=development
ENV MONGODB_URI=mongodb://booking-db:27017/BookingServiceDev
WORKDIR /app
COPY --from=devbuild /app .
CMD ["npm", "run", "dev"]

FROM base AS testbuild 
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci  
COPY . .

FROM base AS test 
ENV NODE_ENV=test
ENV MONGODB_URI=mongodb://booking-db:27017/BookingServiceTest
WORKDIR /app
COPY --from=testbuild /app .
CMD ["npm", "run", "test"]

FROM base AS prodbuild 
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install --production 
RUN npm ci --omit=dev --no-audit
COPY . .

FROM base AS prod
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://booking-db:27017/BookingServiceProd
WORKDIR /app
COPY --from=prodbuild /app .
CMD ["npm", "run", "start"]