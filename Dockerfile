FROM node:8.11.2

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json /usr/src/app/

RUN npm install

COPY . /usr/src/app/

EXPOSE 8080

CMD [ "npm", "start" ]
