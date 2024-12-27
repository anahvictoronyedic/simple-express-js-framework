import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AnySchema } from "joi";

export default class Defense{

    static async createMiddlewareForJoiValidation( schema:AnySchema , reqProperty:'body'|'query'|'params' ){
        return ( req:Request , res:Response , next:NextFunction )=>{
            const { error, value } = schema.validate( req[reqProperty] );
            if( error ) next( createHttpError( 400 , error.message ) );
            else {
                req[reqProperty] = value;
                next();
            }
        };
    }
}