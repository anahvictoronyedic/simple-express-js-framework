import { PLAIN_OBJECT } from "../abstracts/types";
import { Request, Response } from "express";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import bootstrap from "../bootstrap";
import chaiAsPromised from "chai-as-promised";
import chai from "chai";

import SinonTest from "sinon-test";
import Sinon from "sinon";

export default class TestUtils{

    static createFakeReqObject(req?:PLAIN_OBJECT){
        return req as unknown as Request;
    }

    static async setupEnvForUnitTests( onlyUnitTests = true ){
        chai.should();
        chai.use(sinonChai);
        chai.use(chaiAsPromised);

        const sinonTest = SinonTest( Sinon );

        return { sinonTest };
    }

    static async setupEnvForIntegrationTests(){

        /*
        Load the bootstrap program because of the nature of integration test which does not require isolation. Use mini option to indicate the application only need
        a little amount of resources.
        */
        await bootstrap('mini');

        const result = await this.setupEnvForUnitTests(false);
        chai.use(chaiHttp);

        return result;
    }
}
