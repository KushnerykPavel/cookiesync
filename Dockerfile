FROM node:10.0

RUN mkdir /app
WORKDIR /app

COPY ./ /app
RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]