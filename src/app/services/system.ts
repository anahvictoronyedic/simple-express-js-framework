import { Application, Router } from "express";
import fs from "fs";
import path from "path";
import { Controller } from "src/types";

export class System{

    static async registerControllersThroughFolderNames( app:Application | Router , parentFolderPath:string ){
                
        const controllerNames = fs.readdirSync(parentFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

        for( const controllerName of controllerNames ){

            if( !/[]/.(controllerName) ) throw new Error(`failed to load controller ( ${controllerName} ) in ( ${parentFolderPath} ) because it contains invalid characters`);

            const controller:Controller = require( path.join( parentFolderPath , controllerName , `${controllerName}.js` ) );

            
        }

    }
}