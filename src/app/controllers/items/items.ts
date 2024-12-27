import { Request, Response, Router } from "express";
import Defense from "../../services/defense";
import { Controller } from "../../abstracts/types";
import itemsModel from "../../models/items";
import Joi from "joi";
import Constants from "../../abstracts/constants";

class ItemsController implements Controller{

    async registerEndpoints(router: Router): Promise<void> {

        router.use( await Defense.createMiddlewareForJoiValidation( Joi.object({
            slug:Joi.string().required().regex(Constants.SLUG_REGEX),
        }) , 'params' ) );

        router.post( '/:slug/add' ,await Defense.createMiddlewareForJoiValidation( Joi.object({
            quantity:Joi.number().required().integer().positive(),
            expiry:Joi.number().required().integer().positive(),
        }) , 'body' ), this.add);
        
        router.post( '/:slug/sell' ,await Defense.createMiddlewareForJoiValidation( Joi.object({
            quantity:Joi.number().required().integer().positive(),
        }), 'body' ) , this.sell);

        router.get( '/:slug/quantity' , this.get );
    }

    private async add(req:Request , res:Response){

        const { quantity , expiry } = req.body;

        await itemsModel.addItemQuantity( req.params.slug.toString() , quantity , expiry );

        return res.status(200).end();
    } 

    private async sell(req:Request , res:Response){

        const { quantity } = req.body;

        await itemsModel.sellItem( req.params.slug.toString() , quantity );

        return res.status(200).end();
    } 

    private async get(req:Request , res:Response){

        const result = await itemsModel.getItemQuantity( req.params.slug.toString() );

        return res.status(200).json(result);
    }
}

const itemsController = new ItemsController;

export default itemsController;