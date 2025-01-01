import express,{  NextFunction,Request, Response,Application,ErrorRequestHandler } from "express";
import fs from "fs";
import path from "path";
import { Controller } from "../../abstracts/types";
import Constants from "../../abstracts/constants";

export default class CoreRoutines{

    public static readonly objectStore = new Map<string,any>();
    public static getObjectSafely<R>( key:string ){

        if( !this.objectStore.has( key ) ) throw new Error();

        return this.objectStore.get(key ) as R;
    }

    static getApiErrorHandlerMiddleware():ErrorRequestHandler{
        return ( err:any , req:Request , res:Response , next:NextFunction )=>{

            console.log('error : ',err);

            if(res.headersSent){
                return next(err);
            }

            let statusCode = err && ( err.status || err.statusCode ) || 500 ;
            statusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

            const result:any = {};

            if(
            // from the http-errors library
            ( err && err.expose )

            || process.env.NODE_ENV !== 'production' ) {
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

            const controllerClass = require( path.join( parentFolderPath , controllerName , `${controllerName}.js` ) ).default;

            // instantiate the controller
            const controllerInstance = new controllerClass();

            // add it to global object store
            this.objectStore.set( (Constants.GLOBAL_OBJECT_KEYS.controller as any)[controllerName] , controllerInstance );

            const router = express.Router();

            await controllerInstance.registerEndpoints(router);

            app.use( `/${controllerName}` , router );
        }
    }
}