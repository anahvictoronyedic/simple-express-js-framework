import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";
import bootstrap from "./bootstrap";
import CoreRoutines from "./services/core-routines/core-routines";

const app = express();

// setup request body parser
app.use(bodyParser.urlencoded({extended:false}));

// set up cross site origin
app.use(cors());

/*
Load the bootstrap program. Use concrete option to indicate the application will utilize as much resources available.
*/
bootstrap('concrete').then();

// set up controllers
const controllersFolderPath = path.join( __dirname , '/controllers' );
CoreRoutines.registerControllersThroughFolderNames( app ,controllersFolderPath ).then(()=>{
    /*
    add the custom API error handler after controllers are added, so make sure the error handler comes last in the chain.
    */
    app.use(CoreRoutines.getApiErrorHandlerMiddleware());
}).catch((err)=>{
    console.error( err && err.message || 'failed to load controllers' );
    process.exit(1);
});

export default app;