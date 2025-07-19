# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## How to run
* Configure `.env` based on `env.example`
* `npm isntall`       to install dependencies
* Run the databases and apply the schema (see [Databases](#databases))
* `npm start`         to run in prod mode
* `npm run dev`       to run in dev mode
* `npm run test`      to run tests


## Databases
* `docker-compose -f ../infra/docker-compose.yml up -d` to bring up postgres db and clickhouse in docker
* `npx drizzle-kit push` to push latest db schema to postgres


## Configuration
Configuration is read from `.env` or environment variables and validated in `./src/utils/env.ts`


## Footguns
* Dangling promises that throw uncaught errors will crash the server and not call the error handler!
* Pino logging requires that you put objects to log FIRST, before the string message  (and watch our for reserved keys, such as `timestamp`)