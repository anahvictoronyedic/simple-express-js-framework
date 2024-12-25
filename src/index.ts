import dotenv from "dotenv";

import app from './app/app';

// initialize configuration
dotenv.config();

// port is now available to the Node.js runtime 
// as if it were an environment variable
const port = process.env.SERVER_PORT;

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );