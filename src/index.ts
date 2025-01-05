
import server from './app/server';

/**
 * First read the port through the standard way( especially to comply with most PAAS ), then if not available, read it from .env file.
 */
const port = process.env.PORT || process.env.SERVER_PORT;

// start the express server
server.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );