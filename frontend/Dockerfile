ARG NODE_VERSION=22.17.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY ./package*.json /app

RUN npm i -g vite
RUN cd /app
RUN npm i

COPY . /app
