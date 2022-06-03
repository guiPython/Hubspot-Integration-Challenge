FROM node:16-alpine3.14 as development

WORKDIR /usr/src/app

COPY package*.json .
COPY yarn.lock .
COPY .env .

RUN yarn global add tsc

RUN yarn install

COPY . .

RUN yarn build

FROM node:16-alpine3.14 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .
COPY yarn.lock .
COPY Contatos.csv .
COPY .env .

RUN yarn install --frozen-lockfile --prod

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/index.js"]
