import { merge } from "lodash";
import { Response } from "express";
import Sinon from "sinon";
import { PLAIN_OBJECT } from "../../abstracts/types";
import TestUtils from "../../services/test-utils";
import ItemsController from "./items";
import CoreRoutines from "../../services/core-routines/core-routines";
import Constants from "../../abstracts/constants";
import chai from "chai";
import ItemsModel from "../../models/items/items";

let sinonTest:any;

// do priliminary setup for unit test
TestUtils.setupEnvForUnitTests().then((result)=>{
    
    sinonTest = result.sinonTest;

    describe('test items controller',()=>{

        /**
         * creates a fake normalized req object that will be used for testing. Normalized means all required key value have been
         * populated in the req object.
         * @param req the callees format of the fake request object that should be normalized
         * @returns a normalized req object that should be used
         */
        const createFakeReqObject = (req:PLAIN_OBJECT) => TestUtils.createFakeReqObject( merge({
            params:{
                slug:'foo',
            }
        },req) );

        let res:any ;
        let error:Error;

        let itemsModel:Sinon.SinonStubbedInstance<ItemsModel>;
    
        let itemsController:ItemsController;

        before( ()=> {

            itemsModel = Sinon.createStubInstance( ItemsModel );

            // NOTE: after the itemsModel is stubbed, polyfill these properties
            (itemsModel as any).INSUFFICIENT_QUANTITY_REASON = itemsModel.INSUFFICIENT_QUANTITY_REASON || 
            'invalid-reason';

            const objectStoreStub = Sinon.stub(CoreRoutines.objectStore);
            
            objectStoreStub.get.withArgs(Constants.GLOBAL_OBJECT_KEYS.model.items)
            .returns( itemsModel );
            objectStoreStub.has.withArgs(Constants.GLOBAL_OBJECT_KEYS.model.items)
            .returns(true);

            itemsController = new ItemsController();
            itemsController.init({});

            error = new Error();

            const endSpy = Sinon.spy();
            const jsonSpy = Sinon.spy();

            res = {
                json:jsonSpy,
                end:endSpy,
                status:Sinon.stub().returns({end:endSpy,json:jsonSpy}),
            };
        });

        after(()=>{
            Sinon.restore();
        });

        describe('test add middleware',()=>{

            const req = createFakeReqObject( {
                body:{
                    quantity:10,
                    expiry:Date.now() + 10000,
                }
            } );

            afterEach( ()=> {
                Sinon.resetHistory();
            });
        
            it('should respond with status 200 and end the connection when item added successfully',sinonTest( async function (){

                const stub = itemsModel.addItemQuantity.resolves();

                await itemsController.add( req , res as Response , ()=>{} );

                chai.expect(itemsModel.addItemQuantity).to.be.calledOnce;
                chai.expect(res.status).to.be.calledOnceWithExactly(200);
                chai.expect(res.status).to.be.calledBefore(res.end);
                chai.expect(res.end).to.be.calledOnce;

                stub.resetHistory();
            }));

            it('should call the middleware next function when item fails to get added by the model',sinonTest( async function (){

                const stub = itemsModel.addItemQuantity.rejects(error);

                const nextFunction = this.spy();

                await itemsController.add( req , res as Response , nextFunction );

                chai.expect(itemsModel.addItemQuantity).to.be.calledOnce;
                chai.expect(nextFunction).to.be.calledOnceWith(error);

                stub.resetHistory();
            }));
        });

        describe('test sell middleware',()=>{

            const req = createFakeReqObject( {
                body:{
                    quantity:10,
                }
            } );

            afterEach( ()=> {
                Sinon.resetHistory();
            });
        
            it('should respond with status 200 and end the connection when item sale is successful in the model',sinonTest( async function (){

                const stub = itemsModel.sellItem.resolves();

                await itemsController.sell( req , res as Response , ()=>{} );
                chai.expect(itemsModel.sellItem).to.be.calledOnce;
                chai.expect(res.status).to.be.calledOnceWithExactly(200);
                chai.expect(res.status).to.be.calledBefore(res.end);
                chai.expect(res.end).to.be.calledOnce;

                stub.resetHistory();
            }));

            it('should call the middleware next function when an item fails to be sold',sinonTest( async function (){

                const stub = itemsModel.sellItem.rejects(error);

                const nextFunction = this.spy();

                await itemsController.sell( req , res as Response , nextFunction );
                chai.expect(itemsModel.sellItem).to.be.calledOnce;
                chai.expect(nextFunction).to.be.calledOnceWith(error);

                stub.resetHistory();
            }));

            it('should call the middleware next function with object that must have {statusCode:404} set, when no items found to be sold', sinonTest( async function (){

                const stub = itemsModel.sellItem.rejects({
                    reason : itemsModel.INSUFFICIENT_QUANTITY_REASON,
                });

                const nextFunction = this.spy();

                await itemsController.sell( req , res as Response , nextFunction );
                chai.expect(itemsModel.sellItem).to.be.calledOnce;
                chai.expect(nextFunction).to.be.calledOnceWith(Sinon.match({
                    statusCode:404,
                }));

                stub.resetHistory();
            }));
        });

        describe('test get middleware',()=>{

            const req = createFakeReqObject( {
                body:{
                }
            } );

            const result = {
                quantity:10,
                validTill:Date.now() + 20000,
            };

            afterEach( ()=> {
                Sinon.resetHistory();
            });
        
            it('should respond with status 200 and result as json when data is fetched successfully from the model', sinonTest( async function (){
    
                const stub = itemsModel.getItemQuantity.resolves(result);

                await itemsController.get( req , res as Response , ()=>{} );

                chai.expect(itemsModel.getItemQuantity).to.be.calledOnce;
                chai.expect(res.status).to.be.calledOnceWithExactly(200);
                chai.expect(res.status).to.be.calledBefore(res.json);
                chai.expect(res.json).to.be.calledOnceWithExactly(Sinon.match(result));

                stub.resetHistory();
            }));

            it('should call middleware next function when data fetch from model fails',sinonTest( async function (){
    
                const stub = itemsModel.getItemQuantity.rejects(error);

                const nextFunction = this.spy();

                await itemsController.get( req , res as Response , nextFunction );

                chai.expect(itemsModel.getItemQuantity).to.be.calledOnce;
                chai.expect(nextFunction).to.be.calledOnceWith(error);

                stub.resetHistory();
            }));
        });
    });
});