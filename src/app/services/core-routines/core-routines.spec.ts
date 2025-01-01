
import { Application, Response } from "express";
import { extend } from "lodash";
import path from "path";
import fs from "fs";
import Sinon from "sinon";
import TestUtils from "../test-utils";
import CoreRoutines from "./core-routines";
import express from "express";
import ItemsController from "../../controllers/items/items";

// do priliminary setup for unit test
TestUtils.setupEnvForUnitTests();

describe('test items controller',()=>{

    let res:any ;
    let sandbox:Sinon.SinonSandbox;
    let error:Error;

    beforeEach( ()=> {

        sandbox = Sinon.createSandbox();

        error = new Error('an error occured');

        const endSpy = sandbox.spy();
        const jsonSpy = sandbox.spy();

        res = {
            json:jsonSpy,
            end:endSpy,
            status:sandbox.stub().returns({end:endSpy,json:jsonSpy}),
        };
    });

    afterEach( ()=> {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    describe('test callback returned from getApiErrorHandlerMiddleware()',async ()=>{

        const returnedCallback = CoreRoutines.getApiErrorHandlerMiddleware();

        const fakeReqObject = TestUtils.createFakeReqObject( {
            headersSent:true,
        } );

        it('should call next function with error as argument when headers are already sent',()=>{

            const nextFunction = sandbox.spy();

            const req = TestUtils.createFakeReqObject( {
                headersSent:true,
            } );
    
            returnedCallback( error , req , res , nextFunction );

            chai.expect(nextFunction).to.be.calledOnceWith(error);
        });

        it('should respond with status 500 when statusCode cannot be found in error object',()=>{

            returnedCallback( error , fakeReqObject , res , ()=>{} );

            chai.expect(res.status).to.be.calledOnceWithExactly(500);
        });
        
        it('should forcefully respond with status 500 when statusCode in error object is less than 400',()=>{

            returnedCallback( extend(error,{
                statusCode:325,
            }) , fakeReqObject , res , ()=>{} );

            chai.expect(res.status).to.be.calledOnceWithExactly(500);
        });
        
        it('should forcefully respond with status 500 when statusCode in error object is greater than 599',()=>{

            returnedCallback( extend(error,{
                statusCode:601,
            }) , fakeReqObject , res , ()=>{} );

            chai.expect(res.status).to.be.calledOnceWithExactly(500);
        });

        it('should respond with json that contains message field when error object has expose property set to true',()=>{

            returnedCallback( extend(error,{expose:true}) , fakeReqObject , res , ()=>{} );

            chai.expect(res.json).to.be.calledOnceWith( Sinon.match({
                message:error.message,
            }) );
        });
        
        it('should respond with json that contains message field when node is running in development mode',()=>{

            sandbox.stub(process.env,'NODE_ENV').value('development');

            returnedCallback( error, fakeReqObject , res , ()=>{} );

            chai.expect(res.json).to.be.calledOnceWith( Sinon.match({
                message:error.message,
            }) );
        });
    });

    describe('test get middleware',async ()=>{

        // the items controller is the only focus, so that how
        // the tests goes can be controlled. 
        const consideredControllerSlug = 'items';

        const getFakeDirectoryObjects = (names:string[]) => names.map(name => ({
            isDirectory : ()=>true,
            name : `${consideredControllerSlug}${name}`,
        }) );

        const app = {
            use:sandbox.spy()
        };

        const fakeExpressRouter = express.Router();

        const parentFolderPath = path.join(process.env.APP_ROOT_PATH ,'controllers');

        sandbox.stub(fs,'readdirSync')

        .onFirstCall().resolves(getFakeDirectoryObjects(['-+incorrect*'])[0])

        .onSecondCall().rejects(getFakeDirectoryObjects([''])[0]);

        it('should fail to register controllers in a folder that does not have its name in slug format',()=>{
            chai.expect( CoreRoutines.registerControllersThroughFolderNames( app as unknown as Application , parentFolderPath) )
            .to.be.rejected;
        });

        it('should setup an express.Router, hand it to the controller and link the router to the main app',async ()=>{

            const registerEndpointsStub = sandbox.stub(ItemsController.prototype , 'registerEndpoints').resolves();

            sandbox.stub( express , 'Router' ).returns(fakeExpressRouter);

            await CoreRoutines.registerControllersThroughFolderNames( app as unknown as Application , parentFolderPath);

            chai.expect(registerEndpointsStub).to.be.calledOnceWith(fakeExpressRouter);
            chai.expect(registerEndpointsStub).to.be.calledBefore(app.use);
            chai.expect(app.use).to.be.calledOnceWith(`/${consideredControllerSlug}`,fakeExpressRouter);
        });
    });
});