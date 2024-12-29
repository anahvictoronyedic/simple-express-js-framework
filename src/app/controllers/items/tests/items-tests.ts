import { merge } from "lodash";
import { Response } from "express";
import Sinon from "sinon";
import { PLAIN_OBJECT } from "../../../abstracts/types";
import itemsModel from "../../../models/items/items";
import { ItemsController } from "../items";
import TestUtils from "../../../services/test-utils";

TestUtils.setupEnvForUnitTests();

describe('test items controller',()=>{

    const createFakeReqObject = (req:PLAIN_OBJECT) => TestUtils.createFakeReqObject( merge({
        params:{
            slug:'foo',
        }
    },req) );

    let res:any , itemsController:ItemsController,sandbox:Sinon.SinonSandbox,error:Error;

    before(()=>{
        
        itemsController = new ItemsController;
    })
    beforeEach(function () {

        sandbox = Sinon.createSandbox();

        error = new Error();

        res = {
            json:sandbox.spy(),
            end:sandbox.spy(),
            status:sandbox.stub().returns({end:sandbox.spy(),json:sandbox.spy()}),
        };
    });

    afterEach(function () {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    describe('test add middleware',async ()=>{
        
        const req = createFakeReqObject( {
            body:{
                quantity:10,
                expiry:Date.now() + 10000,
            }
        } );

        sandbox.stub(itemsModel,'addItemQuantity')

        // to test when addItemQuantity returns a promise that resolves
        .onFirstCall().resolves()

        // to test when addItemQuantity returns a promise that rejects
        .onSecondCall().rejects(error);

        it('should call res.status(200).end() when item added successfully',()=>{
                        
            itemsController.add( req , res as Response , ()=>{} );

            chai.expect(itemsModel.addItemQuantity).to.be.calledOnce;
            chai.expect(res.status).to.be.calledOnceWithExactly(200);
            chai.expect(res.status).to.be.calledBefore(res.end);
            chai.expect(res.end).to.be.calledOnce;
        });

        it('should call the middleware next function when item fails to get added by the model',()=>{
                            
            const nextFunction = sandbox.spy();

            itemsController.add( req , res as Response , nextFunction );

            chai.expect(itemsModel.addItemQuantity).to.be.calledOnce;
            chai.expect(nextFunction).to.be.calledOnceWith(error);
        });
    });

    describe('test sell middleware',async ()=>{
        
        const req = createFakeReqObject( {
            body:{
                quantity:10,
            }
        } );

        sandbox.stub(itemsModel,'sellItem')

        // to test when sellItem returns a promise that resolves
        .onFirstCall().resolves()

        // to test when sellItem returns a promise that rejects
        .onSecondCall().rejects(error)

        // to test when sellItem returns a promise that rejects due to insufficient number of products to sell
        .onThirdCall().rejects({
            reason : itemsModel.INSUFFICIENT_QUANTITY_REASON,
        });

        it('should call res.status(200).end() when item sale is successful in the model',()=>{
                    
            itemsController.add( req , res as Response , ()=>{} );
            chai.expect(itemsModel.sellItem).to.be.calledOnce;
            chai.expect(res.status).to.be.calledOnceWithExactly(200);
            chai.expect(res.status).to.be.calledBefore(res.end);
            chai.expect(res.end).to.be.calledOnce;
        });

        it('should call the middleware next function when an item fails to be sold',()=>{
            
            const nextFunction = sandbox.spy();

            itemsController.add( req , res as Response , nextFunction );
            chai.expect(itemsModel.sellItem).to.be.calledOnce;
            chai.expect(nextFunction).to.be.calledOnceWith(error);
        });

        it('should call the middleware next function with object that must have {statusCode:404} set, when no items found to be sold',()=>{
                        
            const nextFunction = sandbox.spy();

            itemsController.add( req , res as Response , nextFunction );
            chai.expect(itemsModel.sellItem).to.be.calledOnce;
            chai.expect(nextFunction).to.be.calledOnceWith(Sinon.match({
                statusCode:404,
            }));
        });
    });
    
    describe('test get middleware',async ()=>{
        
        const req = createFakeReqObject( {
            body:{
            }
        } );

        const result = {
            quantity:10,
            validTill:Date.now() + 20000,
        };

        sandbox.stub(itemsModel,'getItemQuantity')

        // to test when getItemQuantity returns a promise that resolves
        .onFirstCall().resolves(result)

        // to test when getItemQuantity returns a promise that rejects
        .onSecondCall().rejects(error);

        it('should call res.status(200).json(result) when data is fetched successfully from the model',()=>{
                
            itemsController.get( req , res as Response , ()=>{} );

            chai.expect(itemsModel.getItemQuantity).to.be.calledOnce;
            chai.expect(res.status).to.be.calledOnceWithExactly(200);
            chai.expect(res.status).to.be.calledBefore(res.json);
            chai.expect(res.json).to.be.calledOnceWithExactly(result);
        });

        it('should call middleware next function when data fetch from model fails',()=>{

            const nextFunction = sandbox.spy();

            itemsController.add( req , res as Response , nextFunction );

            chai.expect(itemsModel.getItemQuantity).to.be.calledOnce;
            chai.expect(nextFunction).to.be.calledOnceWith(error);
        });
    });
});