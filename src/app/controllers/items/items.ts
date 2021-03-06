import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import Defense from "../../services/defense";
import { Controller } from "../../abstracts/types";
import Joi from "joi";
import Constants from "../../abstracts/constants";
import createHttpError from "http-errors";
import { pick } from "lodash";
import ItemsModel from "../../models/items/items";
import CoreRoutines from "../../services/core-routines/core-routines";

export default class ItemsController implements Controller<any>{

    /**
     * The model used to get item data.
     */
    private itemsModel:ItemsModel;

    public constructor(){
    }

    async init(config: any){
        this.itemsModel = CoreRoutines.getObjectSafely<ItemsModel>( Constants.GLOBAL_OBJECT_KEYS.model.items );
    }

    /**
     * @returns an array of middlewares that should come before all endpoints registered in this controller.
     */
    private async getCommonMiddlewares():Promise<RequestHandler[]>{
        
        const slugValidatorMiddleware = await Defense.createMiddlewareForJoiValidation( Joi.object({
            slug:Joi.string().required().regex(Constants.SLUG_REGEX),
        }) , 'params' );

        // a middleware the runs to check if a slug passed in the request exists in the database
        const slugDBExistenceVerificationMiddleware = async ( req:Request , res:Response , next:NextFunction )=>{

            const slug = req.params.slug;

            /**
             * FEATURE REQUEST: Caching should be done here to improve performance
             */
            if( await this.itemsModel.itemExists(slug) ){
                next();
                return;
            }

            next( createHttpError( 400 , `The slug(${slug}) does not exists` , {
                // indicate to the error handler, that the message can be exposed
                expose:true,
            } ) );
        };

        return [slugValidatorMiddleware , slugDBExistenceVerificationMiddleware ];
    }

    /**
     *
     * @param router The express router to register endpoints and middlewares
     */
    async registerEndpoints(router: Router): Promise<void> {

        const commonMiddlewares = await this.getCommonMiddlewares();

        router.post( '/:slug/add' ,...commonMiddlewares,await Defense.createMiddlewareForJoiValidation( Joi.object({
            quantity:Joi.number().required().integer().positive(),
            expiry:Joi.number().required().integer().positive(),
        }) , 'body' ), this.add.bind(this));

        router.post( '/:slug/sell' ,...commonMiddlewares,await Defense.createMiddlewareForJoiValidation( Joi.object({
            quantity:Joi.number().required().integer().positive(),
        }), 'body' ) , this.sell.bind(this));

        router.get( '/:slug/quantity' ,...commonMiddlewares, this.get.bind(this) );
    }

    public async add(req:Request , res:Response , next:NextFunction){

        const { quantity , expiry } = req.body;

        /**
         * because the function of this scope returns a promise( due to async ), errors should be caught and the next function called
         * in catch method.
         *
         * NOTE: starting from express 5, the try catch wont be needed because express handles rejection on the promise returned.
         * Hence when an upgrade is made to express 5, the try catch can be removed.
         */
        try{
            await this.itemsModel.addItemQuantity( req.params.slug.toString() , quantity , expiry );
        }
        catch(err){
            next(err);
            return;
        }

        return res.status(200).end();
    }

    public async sell(req:Request , res:Response, next:NextFunction){

        const { quantity } = req.body;

        // use try catch to catch errors and check out the reason
        try{
            await this.itemsModel.sellItem( req.params.slug.toString() , quantity );
        }
        catch(err){

            // the model returns a reason for special kind of errors
            if( err && err.reason === this.itemsModel.INSUFFICIENT_QUANTITY_REASON ){

                err = createHttpError(404,'cannot sell due to insufficient number of products',{

                    // indicate to the error handler, that the message can be exposed
                    expose:true,
                });
            }

            next(err);
            return;
        }

        return res.status(200).end();
    }

    public async get(req:Request , res:Response, next:NextFunction){

        let result;

        /**
         * because the function of this scope returns a promise( due to async ), errors should be caught and the next function called
         * in catch method.
         *
         * NOTE: starting from express 5, the try catch wont be needed because express handles rejection on the promise returned.
         * Hence when an upgrade is made to express 5, the try catch can be removed.
         */
        try{
            result = pick(await this.itemsModel.getItemQuantity( req.params.slug.toString() ) , ['quantity','validTill']);
        }
        catch(err){
            next(err);
            return;
        }

        return res.status(200).json(result);
    }
}
