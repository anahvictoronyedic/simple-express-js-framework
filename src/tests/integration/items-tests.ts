import { expect } from "chai";
import mySqlDb from "../../app/datastore/mysql-db";
import app from "../../app/server";
import TestUtils from "../../app/services/test-utils";
import util from 'util';
import Constants from "../../app/abstracts/constants";

TestUtils.setupEnvForIntegrationTests();

const defaultTestSlug = 'foo';
const createUrl = ( urlSuffix:string ) => `/items/${defaultTestSlug}/${urlSuffix}`;

const handler = mySqlDb.getHandler();
const queryFunction = util.promisify( handler.query) 
// NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
.bind(handler);

const resetDB = async ()=>{
    return queryFunction({
        sql:`
        DELETE FROM ${Constants.itemsQuantitiesTableName}
        WHERE item_id = ( SELECT id from ${Constants.itemsTableName} WHERE slug = ? )`,
        values:[defaultTestSlug]
    });
};

const addItem = async (quantity:number , expiry:number)=>{
    return queryFunction({
        sql:`INSERT INTO ${Constants.itemsQuantitiesTableName}(item_id,quantity,expiry)
        VALUES(( SELECT id from ${Constants.itemsTableName} WHERE slug = ? ) , ? , ? )`,
        values:[defaultTestSlug,quantity , expiry],
    })
};

describe('test items api endpoint',()=>{

    describe('test add endpoint',async ()=>{

        beforeEach(async ()=>{
            await resetDB();
        });

        it('should respond with status 200',async (done)=>{

            chai.request(app)
            .post(createUrl('/add'))
            .send({
                quantity:20,
                expiry:Date.now()+20000,
            })
            .end(function(err,res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                done();
            });
        });
    });

    describe('test sell endpoint',async ()=>{

        beforeEach(async ()=>{
            await resetDB();
        });

        it('should respond with status 200 when an unexpired quantity of item is sold',async (done)=>{

            const now = Date.now();

            await addItem( 10 , now + 20000);

            chai.request(app)
            .post(createUrl('/sell'))
            .send({
                quantity:5,
            })
            .end(function(err,res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                done();
            });
        });

        it('should respond with status 404 when the quantity of item requested for sale is unavailable',async (done)=>{

            const now = Date.now();

            await addItem( 10 , now + 20000);

            chai.request(app)
            .post(createUrl('/sell'))
            .send({
                quantity:15,
            })
            .end(function(err,res){
                expect(err).to.be.null;
                expect(res).to.have.status(404);

                done();
            });
        });
    });

    describe('test get endpoint',async ()=>{

        beforeEach(async ()=>{
            await resetDB();
        });

        it('should respond with status 200 and valid result in a simple case',async (done)=>{

            const now = Date.now();

            const quantity = 10 ;
            const validTill = now + 10000;

            await addItem( quantity , validTill);

            chai.request(app)
            .post(createUrl('/sell'))
            .send({
                quantity:5,
            })
            .end(function(err,res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                expect(res.body).to.haveOwnProperty('quantity',quantity);
                expect(res.body).to.haveOwnProperty('validTill',validTill);

                done();
            });
        });

        it('should respond with status 200 and valid result in an average case',async (done)=>{

            const now = Date.now();

            await addItem( 11 , now + 10000);
            await addItem(6 , now + 30000);

            chai.request(app)
            .post(createUrl('/sell'))
            .send({
                quantity:5,
            })
            .end(function(err,res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                expect(res.body).to.haveOwnProperty('quantity',17);
                expect(res.body).to.haveOwnProperty('validTill',10000);

                done();
            });
        });

        it('should respond with status 200 and valid result in an extreme case',async (done)=>{

            const now = Date.now();

            const timeDelta = 10000 ;
            const midTimeDelta =timeDelta+10000 ;
            const lastTimeDelta = timeDelta + 8000;

            /**
             * Test extreme usecase whereby different entries of quantities and expiry exist in database.
             */
            await addItem( 3 , now + timeDelta);
            await addItem( 3 , now + midTimeDelta);
            await addItem( 5 , now + lastTimeDelta);

            // delay for {timeDelta} milliseconds
            setTimeout(async ()=>{

                chai.request(app)
                .post(createUrl('/sell'))
                .send({
                    quantity:5,
                })
                .end(function(err,res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);

                    expect(res.body).to.haveOwnProperty('quantity',8);
                    expect(res.body).to.haveOwnProperty('validTill',now + lastTimeDelta);

                    done();
                });
            },timeDelta);
        });
    });
});
