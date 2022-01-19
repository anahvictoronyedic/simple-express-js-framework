
# Design

The application is designed using MVC architecture. There is a bootstrap file that loads resources that will be used by the application whether in http server mode or command line script mode. 

The bootstrap program can be asked to load as much resources available, mostly when starting the app as a http-server or asked to load minimal amount of resources, especially when starting as a commandline script. Below are additional design points of the application.

1) MySQL database is used as RDBMS.
2) There is a global object store, used for dependency injection.
3) Controllers and models are loaded and linked to the application automatically.
4) Files that reside in the `./src/app/scripts` are called scripts files and can be run directly using `ts-node`. See below for detailed information about the scripts.
5) The boostrap program can be run in different modes, which it uses for proper amount of resource allocation. There are two modes currently, concrete and mini. Concrete means the application will use as much resources available which is suitable for express server and mini means it will use little resources which is suitable for scripts and integration testing.

# Installation and Usage

Below are the steps to get the server running.

1) Implement the `.env` file by copying the `.env.sample` file and setting required configuration. For MySql database settings see below.
2) Make sure `tsc` and `ts-node` are installed globally
3) `npm run tsc` will compile the application into a `/dist` folder
4) `node .` will run the `/dist/index.js` 
5) The items endpoints can be accessed by prefixing the url with `/items`. For example to access the sell endpoint use the url `/items/:slug/sell`

# MySql Database

For performance reasons the application will use a pool of connections as various parts of the application accesses the database. 

## Schema

The application database schema queries should be run before starting the server and can be found at `src/app/datastore/db.sql`. It contains DDL statements that creates the tables and procedures.

## Configuration

The database configuration should be set in the .env file. Below is an explanation for various settings.

`MYSQL_CONCRETE_POOL_CONNECTION_LIMIT` : This is the number of connections that should be in the pool when the application is running in concrete mode. Any number from 6 - 12 is suitable.

`MYSQL_MINI_POOL_CONNECTION_LIMIT` : This is the number of connections that should be in the pool when the application is running in mini mode. Any number from 2 - 4 is suitable.

`MYSQL_HOST` : The hostname of the mysql server.

`MYSQL_PORT` : The mysql server port

`MYSQL_USER` : The access username

`MYSQL_PASSWORD` : The access password

`MYSQL_DATABASE`: The database name

# Scripts

Below are information about the various scripts that can be found in the application.

1) Expired items need to be purged by the application periodically. The items can be purged by running `npm run app:script:items-purger`
2) To add new items to the database utilize the `src/app/datastore/insert-item.sql` or run the command `npm run app:script:add-item -- <itemslug>`. Replace &lt;itemslug&gt; with the slug of the item.

# Testing

The application has both unit and integration tests. The unit test programs is spread through out the application and exists close to the tested files. The integration tests is standalone and exists in the `./src/integration-tests` folder. 

The unit tests are isolated while integration tests are not. The tests are run directly in typescript for speed of execution by forgoing direct compilation. The test file names end with `.spec.ts` and wont be compiled by typescript as indicated in the `tsconfig` file.

Below are details on how to run the tests programs. 

1) `npm run unit:test` will run the unit test
2) `npm run integration:test` will run the integration tests. 

# Other Information

1) The code can be linted with `npm run lint`
2) Items are identifiable by slug, which is unique for every item that exists in the database.