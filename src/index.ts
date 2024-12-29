
import server from './app/server';

/**
 * First read the port through the standard way, then if not available, read it from .env
 */
const port = process.env.PORT || process.env.SERVER_PORT;

// start the express server
server.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );