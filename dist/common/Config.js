"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
class Config {
}
Config.network = config.get("RPC");
exports.Config = Config;
//# sourceMappingURL=Config.js.map