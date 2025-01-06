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
const mysql_1 = __importDefault(require("mysql"));
/**
 * This class interfaces the mysql server to various parts of the application.
 */
class MySQLDB {
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = 'connectionLimit' in config && typeof config.connectionLimit === 'number' ?
                /**
                 * If connection limit is provided, rather than a single connection, use a pool of connections for scalability and performance
                 */
                mysql_1.default.createPool(config) :
                mysql_1.default.createConnection(config);
        });
    }
    getHandler() {
        return this.connection;
    }
}
exports.default = MySQLDB;
//# sourceMappingURL=mysql-db.js.map