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
const defense_1 = __importDefault(require("../../services/defense"));
const joi_1 = __importDefault(require("joi"));
const constants_1 = __importDefault(require("../../abstracts/constants"));
const http_errors_1 = __importDefault(require("http-errors"));
const lodash_1 = require("lodash");
const core_routines_1 = __importDefault(require("../../services/core-routines/core-routines"));
class ItemsController {
    constructor() {
    }
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.itemsModel = core_routines_1.default.getObjectSafely(constants_1.default.GLOBAL_OBJECT_KEYS.model.items);
        });
    }
    /**
     *
     * @param router The express router to register endpoints and middlewares
     */
    registerEndpoints(router) {
        return __awaiter(this, void 0, void 0, function* () {
            const slugValidatorMiddleware = yield defense_1.default.createMiddlewareForJoiValidation(joi_1.default.object({
                slug: joi_1.default.string().required().regex(constants_1.default.SLUG_REGEX),
            }), 'params');
            router.post('/:slug/add', slugValidatorMiddleware, yield defense_1.default.createMiddlewareForJoiValidation(joi_1.default.object({
                quantity: joi_1.default.number().required().integer().positive(),
                expiry: joi_1.default.number().required().integer().positive(),
            }), 'body'), this.add.bind(this));
            router.post('/:slug/sell', slugValidatorMiddleware, yield defense_1.default.createMiddlewareForJoiValidation(joi_1.default.object({
                quantity: joi_1.default.number().required().integer().positive(),
            }), 'body'), this.sell.bind(this));
            router.get('/:slug/quantity', slugValidatorMiddleware, this.get.bind(this));
        });
    }
    add(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { quantity, expiry } = req.body;
            /**
             * because the function of this scope returns a promise( due to async ), errors should be caught and the next function called
             * in catch method.
             *
             * NOTE: starting from express 5, the try catch wont be needed because express handles rejection on the promise returned.
             * Hence when an upgrade is made to express 5, the try catch can be removed.
             */
            try {
                yield this.itemsModel.addItemQuantity(req.params.slug.toString(), quantity, expiry);
            }
            catch (err) {
                next(err);
                return;
            }
            return res.status(200).end();
        });
    }
    sell(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { quantity } = req.body;
            // use try catch to catch errors and check out the reason
            try {
                yield this.itemsModel.sellItem(req.params.slug.toString(), quantity);
            }
            catch (err) {
                // the model returns a reason for special kind of errors
                if (err && err.reason === this.itemsModel.INSUFFICIENT_QUANTITY_REASON) {
                    err = (0, http_errors_1.default)(404, 'cannot sell due to insufficient number of products', {
                        // indicate to the error handler, that the message can be exposed
                        expose: true,
                    });
                }
                next(err);
                return;
            }
            return res.status(200).end();
        });
    }
    get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            /**
             * because the function of this scope returns a promise( due to async ), errors should be caught and the next function called
             * in catch method.
             *
             * NOTE: starting from express 5, the try catch wont be needed because express handles rejection on the promise returned.
             * Hence when an upgrade is made to express 5, the try catch can be removed.
             */
            try {
                result = (0, lodash_1.pick)(yield this.itemsModel.getItemQuantity(req.params.slug.toString()), ['quantity', 'validTill']);
            }
            catch (err) {
                next(err);
                return;
            }
            return res.status(200).json(result);
        });
    }
}
exports.default = ItemsController;
//# sourceMappingURL=items.js.map