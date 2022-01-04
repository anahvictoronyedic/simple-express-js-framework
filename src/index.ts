
import server from './app/server';

/**
 * First read the port through the standard way, then if not available, read it from .env
 */
const port = process.env.PORT || process.env.SERVER_PORT;

// start the express server
server.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );