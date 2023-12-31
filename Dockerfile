FROM node:alpine

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
RUN npm install -g json-server

COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "start"]

