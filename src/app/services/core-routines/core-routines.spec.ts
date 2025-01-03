
import { Application, Response } from "express";
import { extend } from "lodash";
import fs, { Dirent } from "fs";
import Sinon from "sinon";

import TestUtils from "../test-utils";
import CoreRoutines from "./core-routines";
import express from "express";
import ItemsController from "../../controllers/items/items";
import chai from "chai";

import Constants from "../../abstracts/constants";
import ItemsModel from "../../models/items/items";

let sinonTest:any;

// do priliminary setup for unit test
TestUtils.setupEnvForUnitTests().then((result)=>{

    sinonTest = result.sinonTest;

    describe('test core-routines services',()=>{

        let res:any ;
        let error:Error;

        before( ()=> {

            error = new Error('an error occured');

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

        describe('test callback returned from getApiErrorHandlerMiddleware()',()=>{

            const returnedCallback = CoreRoutines.getApiErrorHandlerMiddleware();

            const fakeReqObject = TestUtils.createFakeReqObject( {
                headersSent:true,
            } );

            afterEach( ()=> {
                Sinon.resetHistory();
            });
        
            it('should call next function with error as argument when headers are already sent',sinonTest(function(){

                const nextFunction = this.spy();

                returnedCallback( error , TestUtils.createFakeReqObject() , extend({},res,{
                    headersSent:true,
                }) , nextFunction );

                chai.expect(nextFunction).to.be.calledOnceWith(error);
            }));

            it('should respond with status 500 when statusCode cannot be found in error object',sinonTest(function(){

                returnedCallback( error , fakeReqObject , res , ()=>{} );

                chai.expect(res.status).to.be.calledOnceWithExactly(500);
            }));
            
            it('should forcefully respond with status 500 when statusCode in error object is less than 400',sinonTest(function(){

                returnedCallback( extend({},error,{
                    statusCode:325,
                }) , fakeReqObject , res , ()=>{} );

                chai.expect(res.status).to.be.calledOnceWithExactly(500);
            }));
            
            it('should forcefully respond with status 500 when statusCode in error object is greater than 599',sinonTest(function(){

                returnedCallback( extend({},error,{
                    statusCode:601,
                }) , fakeReqObject , res , ()=>{} );

                chai.expect(res.status).to.be.calledOnceWithExactly(500);
            }));

            it('should respond with json that contains message field when error object has expose property set to true',sinonTest(function(){

                // IMPORTANT NOTE: cloning the error object or using merge/extend/assign will not copy the error object.
                const newError = {
                    message:error.message,
                    expose:true,
                };

                returnedCallback( newError , fakeReqObject , res , ()=>{} );

                chai.expect(res.json).to.be.calledOnceWith( Sinon.match({
                    message:error.message,
                }) );
            }));
            
            it('should respond with json that contains message field when node.js is running in development mode',sinonTest(function(){

                this.stub(process.env,'NODE_ENV').value('development');

                returnedCallback( error, fakeReqObject , res , ()=>{} );

                chai.expect(res.json).to.be.calledOnceWith( Sinon.match({
                    message:error.message,
                }) );
            }));
        });

        describe('test registerControllersThroughFolderNames()',()=>{

            // the items controller is the only focus, so that how
            // the tests goes can be controlled. 
            const consideredControllerSlug = 'items';

            const getFakeDirectoryObjects = (names:string[]) => names.map(name => ({
                isDirectory : ()=>true,
                name : `${consideredControllerSlug}${name}`,
            }) ) as unknown as Dirent[];

            const fakeExpressRouter = express.Router();

            const folderPath ={controller: process.env.APP_CONTROLLERS_PATH,model:process.env.APP_MODELS_PATH};

            let app:{use:any};

            beforeEach(()=>{
                app = {
                    use:Sinon.spy()
                };  
            });

            afterEach( ()=> {
                Sinon.resetHistory();
            });
        
            it('should fail to register controllers in a folder that does not have its name in slug format',sinonTest(function(){
                
                this.stub(fs,'readdirSync').returns(getFakeDirectoryObjects(['-+incorrect*']));

                chai.expect( CoreRoutines.registerControllersThroughFolderNames( app as unknown as Application , folderPath) )
                .to.be.rejected;
            }));

            type CallbackStubsArgType = {readdirSyncStub:Sinon.SinonStub , registerEndpointsStub:Sinon.SinonStub,
                routerStub : Sinon.SinonStub , controllerInitStub: Sinon.SinonStub,modelInitStub: Sinon.SinonStub,
                objectStoreStubbable : Sinon.SinonStubbedInstance<Map<any,any>> } ;

            const testFlow = async function(cb: ( stubs:CallbackStubsArgType )=>Promise<void> ) {

                const objectStoreStubbable = this.stub(CoreRoutines.objectStore);

                const modelObjectStoreKey = Constants.GLOBAL_OBJECT_KEYS.model[consideredControllerSlug];

                const mysqlSystemObjectStoreKey = Constants.GLOBAL_OBJECT_KEYS.system.mysql;

                objectStoreStubbable.get.withArgs(modelObjectStoreKey)
                .returns({} );
                objectStoreStubbable.has.withArgs(modelObjectStoreKey)
                .returns(true);

                objectStoreStubbable.get.withArgs(mysqlSystemObjectStoreKey)
                .returns({} );
                objectStoreStubbable.has.withArgs(mysqlSystemObjectStoreKey)
                .returns(true);

                const readdirSyncStub = this.stub(fs,'readdirSync').returns(getFakeDirectoryObjects(['']));

                const controllerInitStub = this.stub(ItemsController.prototype , 'init');
                const modelInitStub = this.stub(ItemsModel.prototype , 'init');

                const registerEndpointsStub = this.stub(ItemsController.prototype , 'registerEndpoints').resolves();

                const routerStub = this.stub( express , 'Router' ).returns(fakeExpressRouter);

                await CoreRoutines.registerControllersThroughFolderNames( app as unknown as Application , folderPath);

                await cb({
                    controllerInitStub,
                    modelInitStub,
                    registerEndpointsStub,
                    readdirSyncStub,
                    routerStub,
                    objectStoreStubbable,
                });
            };

            it('should first instantiate the model, then the controller and set both objects in the app object store',sinonTest(async function(){
                await testFlow.call(this , async (stubs:CallbackStubsArgType)=>{

                    const modelObjectStoreKey = Constants.GLOBAL_OBJECT_KEYS.model[consideredControllerSlug];
                    const controllerObjectStoreKey = Constants.GLOBAL_OBJECT_KEYS.controller[consideredControllerSlug];

                    chai.expect(stubs.objectStoreStubbable.set.getCall(0)).to.be.calledWith( modelObjectStoreKey , Sinon.match.any );
                    chai.expect(stubs.objectStoreStubbable.set.getCall(1)).to.be.calledWith( controllerObjectStoreKey , Sinon.match.any );
                });
            }));

            it('should setup an express.Router, hand it to the controller and link the router to the main app',sinonTest(async function(){
                
                testFlow.call(this,async (stubs:CallbackStubsArgType)=>{

                    chai.expect(stubs.controllerInitStub).to.be.calledOnce;
                    chai.expect(stubs.modelInitStub).to.be.calledOnce;
                        
                    chai.expect(stubs.registerEndpointsStub).to.be.calledOnceWith(fakeExpressRouter);
                    chai.expect(stubs.registerEndpointsStub).to.be.calledBefore(app.use);
                    chai.expect(app.use).to.be.calledOnceWith(`/${consideredControllerSlug}`,fakeExpressRouter);    
                });
            }));
        });
    });
});
