import express,{ Application, Router } from "express";
import fs from "fs";
import path from "path";
import { Controller } from "../abstracts/types";
import Constants from "../abstracts/constants";

export default class CoreRoutines{

    static async registerControllersThroughFolderNames( app:Application , parentFolderPath:string ){
                
        const controllerNames = fs.readdirSync(parentFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

        for( const controllerName of controllerNames ){

            if( !Constants.SLUG_REGEX.test(controllerName) ) throw new Error(`failed to load controller ( ${controllerName} ) in ( ${parentFolderPath} ) because it contains invalid characters`);

            const controller:Controller = require( path.join( parentFolderPath , controllerName , `${controllerName}.js` ) );

            const router = express.Router();

            await controller.registerEndpoints(router);

            app.use( `/${controllerName}` , router );
        }
    }
}