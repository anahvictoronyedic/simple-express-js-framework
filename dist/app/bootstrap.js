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
const mysql_db_1 = __importDefault(require("./datastore/mysql-db"));
const lodash_1 = require("lodash");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const core_routines_1 = __importDefault(require("./services/core-routines/core-routines"));
const constants_1 = __importDefault(require("./abstracts/constants"));
// initialize configuration
dotenv_1.default.config();
// make sure node_env is always set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.APP_ROOT_PATH = path_1.default.join(__dirname, '../../');
process.env.APP_CONTROLLERS_PATH = path_1.default.join(__dirname, '/controllers');
process.env.APP_MODELS_PATH = path_1.default.join(__dirname, '/models');
console.log('process.env.APP_ROOT_PATH : ', process.env.APP_ROOT_PATH);
let boostrapState;
const boostrapper = function (appLevel, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (boostrapState != undefined)
            return;
        return (() => __awaiter(this, void 0, void 0, function* () {
            boostrapState = 'loading';
            const mysqlConfig = {
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                port: Number(process.env.MYSQL_PORT),
                database: process.env.MYSQL_DATABASE,
                connectionLimit: Number(appLevel === 'concrete' ? process.env.MYSQL_CONCRETE_POOL_CONNECTION_LIMIT :
                    process.env.MYSQL_MINI_POOL_CONNECTION_LIMIT),
                multipleStatements: true,
            };
            options = (0, lodash_1.merge)({
                mysql: mysqlConfig,
            }, options);
            console.log('bootstrapping with config : ', options);
            const mySqlDb = new mysql_db_1.default();
            yield mySqlDb.init(options.mysql);
            core_routines_1.default.objectStore.set(constants_1.default.GLOBAL_OBJECT_KEYS.system.mysql, mySqlDb);
        }))().then(() => {
            boostrapState = 'loaded';
        }).catch((err) => {
            boostrapState = 'error';
            console.error('Bootstrapper failed to complete with exception : ', err);
            process.exit(1);
        });
    });
};
exports.default = boostrapper;
//# sourceMappingURL=bootstrap.js.map