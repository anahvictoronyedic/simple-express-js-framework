"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const bootstrap_1 = __importDefault(require("./bootstrap"));
const core_routines_1 = __importDefault(require("./services/core-routines/core-routines"));
const app = (0, express_1.default)();
// setup request body parser
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
// set up cross site origin
app.use((0, cors_1.default)());
/*
Load the bootstrap program. Use concrete option to indicate the application will utilize as much resources available.
*/
(0, bootstrap_1.default)('concrete').then(() => {
    // set up controllers
    core_routines_1.default.registerControllersThroughFolderNames(app, { controller: process.env.APP_CONTROLLERS_PATH, model: process.env.APP_MODELS_PATH }).then(() => {
        /*
        add the custom API error handler after controllers are added, to make sure the error handler comes last in the chain.
        */
        app.use(core_routines_1.default.getApiErrorHandlerMiddleware());
    }).catch((err) => {
        console.error(err && err.message || 'failed to load controllers : ERROR OBJECT : ', err);
        process.exit(1);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map