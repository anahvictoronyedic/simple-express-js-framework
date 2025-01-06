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
exports.ItemsPurger = void 0;
const bootstrap_1 = __importDefault(require("../bootstrap"));
const items_1 = __importDefault(require("../models/items/items"));
class ItemsPurger {
    constructor() {
        this.init();
    }
    init() {
        this.itemsModel = new items_1.default();
        this.itemsModel.init({});
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear the items that needs purging
            this.itemsModel.purgeItems();
        });
    }
}
exports.ItemsPurger = ItemsPurger;
/*
Load the bootstrapper and use mini option to indicate the application only need a little amount of resources, an economical choice
that could save substancial money as the server scales.
*/
(0, bootstrap_1.default)('mini').then(() => {
    const itemsPurger = new ItemsPurger();
    // run the script
    itemsPurger.run().then(() => {
        console.log('script executed successfully');
    }).catch((e) => {
        console.error('script failed', e);
    });
});
//# sourceMappingURL=items-purger.js.map