import { PLAIN_OBJECT } from "../abstracts/types";
import { Request, Response } from "express";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import bootstrap from "../bootstrap";

export default class TestUtils{

    static createFakeReqObject(req:PLAIN_OBJECT){
        return req as unknown as Request;
    }

    static setupEnvForUnitTests( onlyUnitTests = true ){
        chai.should();
        chai.use(sinonChai);
    }

    static setupEnvForIntegrationTests(){

        /*
        Load the bootstrap program because of the nature of integration test. Use mini option to indicate the application only need
        a little amount of resources.
        */
        bootstrap('mini').then();

        TestUtils.setupEnvForUnitTests(false);
        chai.use(chaiHttp);
    }
}
