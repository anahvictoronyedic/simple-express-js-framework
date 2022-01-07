import { expect } from "chai";
import app from "../app/server";
import TestUtils from "../app/services/test-utils";
import util from 'util';
import Constants from "../app/abstracts/constants";
import CoreRoutines from "../app/services/core-routines/core-routines";
import MySQLDB from "../app/datastore/mysql-db";
import chai from "chai";

TestUtils.setupEnvForIntegrationTests().then(()=>{

    const defaultTestSlug = 'foo';
    const createUrl = ( urlSuffix:string ) => `/items/${defaultTestSlug}/${urlSuffix}`;

    const mySqlDb = CoreRoutines.getObjectSafely<MySQLDB>( Constants.GLOBAL_OBJECT_KEYS.system.mysql );
    const handler = mySqlDb.getHandler();
    const queryFunction = util.promisify(handler.query)
    // NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
    .bind(handler);

    // will be used to clear the tables for testing
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
            VALUES(( SELECT id from ${Constants.itemsTableName} WHERE slug = ? ) , ? , FROM_UNIXTIME(? * 0.001) )`,
            values:[defaultTestSlug,quantity , expiry],
        });
    };

    describe('test items api endpoint',()=>{

        describe('test add endpoint', ()=>{

            beforeEach(async ()=>{
                await resetDB();
            });

            it('should respond with status 200',async ()=>{

                return chai.request(app)
                .post(createUrl('add'))
                .send({
                    quantity:20,
                    expiry:Date.now()+20000,
                })
                .then(function(res){
                    expect(res).to.have.status(200);
                });
            });
        });

        describe('test sell endpoint', ()=>{

            beforeEach(async ()=>{
                await resetDB();
            });

            it('should respond with status 200 when an unexpired quantity of item is sold',async ()=>{

                const now = Date.now();

                await addItem( 10 , now + 20000);
                
                return chai.request(app)
                .post(createUrl('sell'))
                .send({
                    quantity:5,
                })
                .then(function(res){
                    expect(res).to.have.status(200);
                });
            });

            it('should respond with status 404 when the quantity of item requested for sale is unavailable',async ()=>{

                const now = Date.now();

                await addItem( 10 , now + 20000);

                return chai.request(app)
                .post(createUrl('sell'))
                .send({
                    quantity:15,
                })
                .then(function(res){
                    expect(res).to.have.status(404);
                });
            });
        });

        describe('test get endpoint', ()=>{

            beforeEach(async ()=>{
                await resetDB();
            });

            // in simple case, the validity of the return values in the focus
            it('should respond with status 200 and valid result in a simple case',async ()=>{

                const now = Date.now();

                const quantity = 10 ;
                const validTill = now + 10000;

                await addItem( quantity , validTill);

                return chai.request(app)
                .get(createUrl('quantity'))
                .then(function(res){
                    expect(res).to.have.status(200);

                    expect(res.body).to.have.own.property('quantity',quantity);
                    expect(res.body).to.have.own.property('validTill',validTill);
                });
            });

            // in average case, the focus is to check if the system returns the sum of all( with different expiry ) available quantity of items and 
            // also returns the least expiry time
            it('should respond with status 200 and valid result in an average case',async ()=>{

                const now = Date.now();

                const firstTime =  now + 10000;

                await addItem( 11 ,firstTime);
                await addItem(6 , now + 30000);

                return chai.request(app)
                .get(createUrl('quantity'))
                .then(function(res){
                    expect(res).to.have.status(200);

                    expect(res.body).to.haveOwnProperty('quantity',17);
                    expect(res.body).to.haveOwnProperty('validTill',firstTime);
                });
            });

            // in expreme case, the focus is to test if the system wont regard a quantity of items that has expired
            it('should respond with status 200 and valid result in an extreme case',async ()=>{

                const now = Date.now();

                const timeDelta = 5000;
                const midTimeDelta = timeDelta + 10000;
                const lastTimeDelta = timeDelta + 8000;

                /**
                 * Test extreme usecase whereby different entries of quantities and expiry exist in database.
                 */
                await addItem( 3 , now + timeDelta);
                await addItem( 3 , now + midTimeDelta);
                await addItem( 5 , now + lastTimeDelta);

                // tolerance to cater for fluctuations in expected latency
                const delayTolerance = 1000;

                // delay for {timeDelta} milliseconds, to allow items to expire
                await new Promise( resolve => setTimeout(resolve,timeDelta + delayTolerance) );

                return chai.request(app)
                .get(createUrl('quantity'))
                .then(function(res){
                    expect(res).to.have.status(200);

                    expect(res.body).to.haveOwnProperty('quantity',8);
                    expect(res.body).to.haveOwnProperty('validTill',now + lastTimeDelta);
                });
            })
            // this particular test uses delay, hence tell mocha to give enough time
            .timeout(20000);
        });
    });
});