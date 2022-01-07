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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = __importDefault(require("../../abstracts/constants"));
class CoreRoutines {
    /**
     *
     * @param key The key for the object
     * @returns The Object
     *
     * This methods makes the code defensive and callers that critically need the object dont need to test if null.
     * If the object is not in the store and exception is thrown.
     */
    static getObjectSafely(key) {
        if (!this.objectStore.has(key))
            throw new Error();
        return this.objectStore.get(key);
    }
    /**
     * This checks if the application is running as typescript, and not javascript.
     */
    static isRunningAsTypescript() {
        const ext = path_1.default.extname(__filename);
        return ext == '.ts' || ext == '.tsx';
    }
    /**
     *
     * @returns Error handler middleware, which in most cause should be registered last in express
     * middleware pipeline.
     */
    static getApiErrorHandlerMiddleware() {
        return (err, req, res, next) => {
            const isDevMode = process.env.NODE_ENV === 'development';
            // if( isDevMode ) console.log('CoreRoutines.getApiErrorHandlerMiddleware() error : ' , err );
            if (res.headersSent) {
                return next(err);
            }
            let statusCode = err && (err.status || err.statusCode) || 500;
            statusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500;
            const result = {};
            // message could expose sensitive info, hence only if these conditions are met
            if (
            // from the http-errors library
            (err && err.expose)
                || isDevMode) {
                result.message = err.message;
            }
            return res.status(statusCode).json(result);
        };
    }
    /**
     * This code does heavy lifting of
     * 1) instantiating controllers and models
     * 2) linking the controllers endpoints to the express app
     *
     * When a new folder is created the folder that contains all controllers. This method automatically links it to the rest of the application.
     *
     * A controller folder MUST have its name is slug format and it MUST contain a typescript file that has its name the same with the controller folder name.
     *
     * Lets say
     * (parentControllerPath) - is the folder that contains all controllers.
     * (parentModelPath) - is the folder that contains all models.
     * if (parentControllerPath/schools) is a folder. Then schools is a controller name.
     * (parentControllerPath/schools/schools.ts) must be a file that by default exports a class that implements the controller interface.
     * (parentModelPath/schools/schools.ts) must be a file that by default exports a class that implements the model interface.
     *
     * @param app The express application
     * @param folderPath An object that contains both root controllers and root models path.
     */
    static registerControllersThroughFolderNames(app, folderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const controllerNames = fs_1.default.readdirSync(folderPath.controller, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            for (const controllerName of controllerNames) {
                if (!constants_1.default.SLUG_REGEX.test(controllerName))
                    throw new Error(`failed to load controller ( ${controllerName} ) in ( ${folderPath.controller} ) because it is not in slug format due to invalid characters`);
                const controllerObjectKeys = constants_1.default.GLOBAL_OBJECT_KEYS.controller;
                const modelObjectKeys = constants_1.default.GLOBAL_OBJECT_KEYS.model;
                if (!(controllerName in controllerObjectKeys))
                    throw new Error(`failed to find key to set the controller in the app object store`);
                if (!(controllerName in modelObjectKeys))
                    throw new Error(`failed to find key to set the model in the app object store`);
                const ext = this.isRunningAsTypescript() ? 'ts' : 'js';
                const ControllerClass = require(path_1.default.join(folderPath.controller, controllerName, `${controllerName}.${ext}`)).default;
                const ModelClass = require(path_1.default.join(folderPath.model, controllerName, `${controllerName}.${ext}`)).default;
                // instantiate the model before the controller
                const modelInstance = new ModelClass();
                yield modelInstance.init();
                this.objectStore.set(modelObjectKeys[controllerName], modelInstance);
                // instantiate the controller
                const controllerInstance = new ControllerClass();
                yield controllerInstance.init();
                this.objectStore.set(controllerObjectKeys[controllerName], controllerInstance);
                const router = express_1.default.Router();
                yield controllerInstance.registerEndpoints(router);
                app.use(`/${controllerName}`, router);
            }
        });
    }
}
exports.default = CoreRoutines;
CoreRoutines.objectStore = new Map();
//# sourceMappingURL=core-routines.js.map