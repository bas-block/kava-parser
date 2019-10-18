"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorHandler = require("errorhandler");
//import { Database } from "./models/Database";
const ApiRoutes_1 = require("./routes/ApiRoutes");
const expressValidator = require("express-validator");
const winston = require("winston");
const Database_1 = require("./models/Database");
const config = require("config");
const cors = require("cors");
const compression = require("compression");
const port = process.env.PORT || 8000;
class App {
    constructor() {
        // create app
        this.app = express();
        // configure
        this.configureMiddleware();
        // setup database
        this.setupDatabase();
        // add routes
        this.addRoutes();
        // eventually start
        this.launch();
    }
    configureMiddleware() {
        this.app.use(compression());
        this.app.use(cors());
        this.app.set("port", port);
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(expressValidator());
        // configure winston logger
        winston.add(winston.transports.File, {
            filename: "sdk-parser.log",
            level: "info",
            json: true,
            eol: "\r\n",
            timestamp: true
        });
        // remove for production
        this.app.use(errorHandler());
    }
    setupDatabase() {
        this.db = new Database_1.Database(config.get("MONGO.URI"));
        this.db.connect();
    }
    addRoutes() {
        this.app.use("/", ApiRoutes_1.router);
    }
    launch() {
        this.app.listen(this.app.get("port"), () => {
            winston.info("App is running at http://localhost:%d in %s mode", this.app.get("port"), this.app.get("env"));
            winston.info("Press CTRL-C to stop\n");
        });
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map