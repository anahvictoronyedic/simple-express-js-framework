import { PLAIN_OBJECT } from "../abstracts/types";
import { Request, Response } from "express";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import bootstrap from "../bootstrap";
import chaiAsPromised from "chai-as-promised";
import proxyrequire from "proxyrequire";

export default class TestUtils{

    static createFakeReqObject(req:PLAIN_OBJECT){
        return req as unknown as Request;
    }

    static setupEnvForUnitTests( onlyUnitTests = true ){
        chai.should();
        chai.use(sinonChai);
        chai.use(chaiAsPromised);

        proxyrequire.registerNode();
    }

    static setupEnvForIntegrationTests(){

        /*
        Load the bootstrap program because of the nature of integration test which does not require isolation. Use mini option to indicate the application only need
        a little amount of resources.
        */
        bootstrap('mini').then();

        TestUtils.setupEnvForUnitTests(false);
        chai.use(chaiHttp);
    }
}
