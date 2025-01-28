#from https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app
FROM node:lts-alpine

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . ./

EXPOSE 5173

# run vite in dev
CMD [ "npm", "run", "dev", "--", "--host" ]
