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
exports.AddItem = void 0;
const bootstrap_1 = __importDefault(require("../bootstrap"));
const lodash_1 = require("lodash");
const constants_1 = __importDefault(require("../abstracts/constants"));
const util_1 = __importDefault(require("util"));
const core_routines_1 = __importDefault(require("../services/core-routines/core-routines"));
class AddItem {
    constructor() {
        this.mySqlDb = core_routines_1.default.getObjectSafely(constants_1.default.GLOBAL_OBJECT_KEYS.system.mysql);
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.mySqlDb.getHandler();
            const slug = args.slug;
            if (!(0, lodash_1.isString)(slug))
                throw new Error('cannot add item due to invalid slug');
            yield util_1.default.promisify(handler.query)
                // NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
                .bind(handler)({
                sql: `INSERT INTO ${constants_1.default.itemsTableName}(slug) VALUES(?)`,
                values: [slug],
            });
        });
    }
}
exports.AddItem = AddItem;
/*
Load the bootstrapper and use mini option to indicate the application only need a little amount of resources.
*/
(0, bootstrap_1.default)('mini').then(() => {
    const argv = process.argv.slice(2);
    new AddItem().run({
        slug: argv.length > 0 ? argv[0] : null,
    }).then(() => {
        console.log('script executed successfully');
    }).catch((e) => {
        console.error('script failed', e);
    });
});
//# sourceMappingURL=add-item.js.map