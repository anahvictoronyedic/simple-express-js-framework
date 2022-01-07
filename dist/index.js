"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./app/server"));
/**
 * First read the port through the standard way( especially to comply with most PAAS ), then if not available, read it from .env file.
 */
const port = process.env.PORT || process.env.SERVER_PORT;
// start the express server
server_1.default.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map