import express,{  NextFunction,Request, Response,Application,ErrorRequestHandler } from "express";
import fs from "fs";
import path from "path";
import { Controller } from "../abstracts/types";
import Constants from "../abstracts/constants";

export default class CoreRoutines{

    static getApiErrorHandlerMiddleware():ErrorRequestHandler{
        return ( err:any , req:Request , res:Response , next:NextFunction )=>{

            if(res.headersSent){
                return next(err);
            }

            let statusCode = err && ( err.status || err.statusCode ) || 500 ;
            statusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

            const result:any = {};

            if(
            // from the http-errors library
            ( err && err.expose )

            || process.env.NODE_ENV != 'production' ) {
                result.message = err.message ;
            }

            return res.status(statusCode).json(result);
        };
    }

    static async registerControllersThroughFolderNames( app:Application , parentFolderPath:string ){
                
        const controllerNames = fs.readdirSync(parentFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

        for( const controllerName of controllerNames ){

            if( !Constants.SLUG_REGEX.test(controllerName) ) throw new Error(`failed to load controller ( ${controllerName} ) in ( ${parentFolderPath} ) because it is not in slug format due to invalid characters`);

            const controller:Controller = require( path.join( parentFolderPath , controllerName , `${controllerName}.js` ) );

            const router = express.Router();

            await controller.registerEndpoints(router);

            app.use( `/${controllerName}` , router );
        }
    }
}