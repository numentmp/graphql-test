# syntax=docker/dockerfile:1

FROM node:latest
ENV NODE_ENV=production

WORKDIR /app

COPY app/package.json app/package-lock.json ./

RUN npm install --production

USER node

COPY app /app

EXPOSE 8080/tcp

CMD ["npm", "run", "start"]
