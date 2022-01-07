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
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const bootstrap_1 = __importDefault(require("../bootstrap"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_1 = __importDefault(require("chai"));
const sinon_test_1 = __importDefault(require("sinon-test"));
const sinon_1 = __importDefault(require("sinon"));
class TestUtils {
    static createFakeReqObject(req = {}) {
        return req;
    }
    static setupEnvForUnitTests(onlyUnitTests = true) {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.default.should();
            chai_1.default.use(sinon_chai_1.default);
            chai_1.default.use(chai_as_promised_1.default);
            const sinonTest = (0, sinon_test_1.default)(sinon_1.default);
            return { sinonTest };
        });
    }
    static setupEnvForIntegrationTests() {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            Load the bootstrap program because of the nature of integration test which does not require isolation. Use mini option to indicate the application only need
            a little amount of resources.
            */
            yield (0, bootstrap_1.default)('mini');
            const result = yield this.setupEnvForUnitTests(false);
            chai_1.default.use(chai_http_1.default);
            return result;
        });
    }
}
exports.default = TestUtils;
//# sourceMappingURL=test-utils.js.map