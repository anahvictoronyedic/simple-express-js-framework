"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const constants_1 = __importDefault(require("../../abstracts/constants"));
const core_routines_1 = __importDefault(require("../../services/core-routines/core-routines"));
class ItemsModel {
    constructor() {
        this.INSUFFICIENT_QUANTITY_REASON = 'insufficient-item-quantity';
    }
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.mySqlDb = core_routines_1.default.getObjectSafely(constants_1.default.GLOBAL_OBJECT_KEYS.system.mysql);
            const dbHandler = this.mySqlDb.getHandler();
            // promisify the function to make it thenable.
            this.queryFunction = util_1.default.promisify(dbHandler.query)
                // NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
                .bind(dbHandler);
        });
    }
    sellItem(idOrSlug, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const mySqlResultVariableName = '@success';
            const mySqlItemIdVariableName = '@item_id';
            const query = `
        SET ${mySqlResultVariableName} := FALSE;
        ${this.isIdASlug(idOrSlug) ? this.getIdQueryFragment(idOrSlug, mySqlItemIdVariableName) : `SET ${mySqlItemIdVariableName} := ?`};`
                // call the mysql procedure
                + `CALL sell_by_quantity( ${mySqlItemIdVariableName} , ? , ${mySqlResultVariableName} );
        SELECT ${mySqlResultVariableName};`;
            return this.queryFunction({
                sql: query,
                values: [idOrSlug, quantity],
            }).catch((err) => {
                return Promise.reject({ reason: 'error', err });
            }).then((results) => {
                if (results.length > 0
                    // this expression uses mysql representation of true and false, which is 1 and 0 respectively.
                    && results[results.length - 1][0][mySqlResultVariableName] == 1) {
                    return Promise.resolve();
                }
                return Promise.reject({ reason: this.INSUFFICIENT_QUANTITY_REASON });
            });
        });
    }
    addItemQuantity(idOrSlug, quantity, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        INSERT INTO ${constants_1.default.itemsQuantitiesTableName}( item_id , quantity , expiry )
        VALUES( ${this.getIdQueryFragment(idOrSlug)} , ? , ` +
                // convert from milliseconds to seconds by mutiplying with 0.001
                `FROM_UNIXTIME(? * 0.001) `
                + `) `;
            return this.queryFunction({
                sql: query,
                values: [idOrSlug, quantity, expiry]
            }).then((results) => {
                if (results.affectedRows > 0)
                    return Promise.resolve();
                return Promise.reject();
            });
        });
    }
    getItemQuantity(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        SELECT SUM(quantity) as total_quantity , MIN( UNIX_TIMESTAMP( expiry ) * 1000 ) as min_expiry_epoch_millis
        FROM ${constants_1.default.itemsQuantitiesTableName}
        WHERE item_id = ${this.getIdQueryFragment(idOrSlug)} AND expiry > CURRENT_TIMESTAMP AND obsolete = FALSE
        `;
            return this.queryFunction({
                sql: query,
                values: [idOrSlug]
            }).then((results) => {
                const result = { quantity: 0, validTill: null };
                if (results.length > 0) {
                    const row = results[0];
                    const quantity = row.total_quantity;
                    if (quantity > 0) {
                        result.quantity = quantity;
                        result.validTill = row.min_expiry_epoch_millis;
                    }
                }
                return result;
            });
        });
    }
    purgeItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        DELETE FROM ${constants_1.default.itemsQuantitiesTableName}
        WHERE obsolete = TRUE OR expiry < CURRENT_TIMESTAMP`;
            return this.queryFunction({
                sql: query,
            });
        });
    }
    getIdQueryFragment(idOrSlug, sqlVarNameForSlug) {
        return this.isIdASlug(idOrSlug) ? `${` ${sqlVarNameForSlug ? '' : '('} SELECT id ${sqlVarNameForSlug ? `INTO ${sqlVarNameForSlug}` : ''} FROM ${constants_1.default.itemsTableName} WHERE slug = ? ${sqlVarNameForSlug ? '' : ')'} `} ` : '?';
    }
    isIdASlug(idOrSlug) {
        return typeof idOrSlug !== 'number';
    }
}
exports.default = ItemsModel;
//# sourceMappingURL=items.js.map