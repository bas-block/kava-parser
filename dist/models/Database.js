"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const winston = require("winston");
const Bluebird = require("bluebird");
mongoose.Promise = Bluebird;
class Database {
    constructor(dbURI) {
        this.dbURI = dbURI;
    }
    connect() {
        const options = {
            autoIndex: true,
            poolSize: 500,
            // sets how many times to try reconnecting
            reconnectTries: Number.MAX_VALUE,
            // sets the delay between every retry (milliseconds)
            reconnectInterval: 1000
        };
        mongoose.connect(this.dbURI, options)
            .then(() => {
            this.hookIntoConnectionMonitorEvents();
            this.setupShutdownHandlers();
        })
            .catch((err) => {
            winston.error(`Could not connect to Mongo with error: ${err}`);
        });
    }
    hookIntoConnectionMonitorEvents() {
        mongoose.connection.on("connected", () => {
            winston.info("Mongoose connected");
        });
        mongoose.connection.on("error", (err) => {
            winston.info(`Mongoose connection error: ${err}`);
        });
        mongoose.connection.on("disconnected", () => {
            winston.info("Mongoose disconnected");
        });
    }
    setupShutdownHandlers() {
        // SIGUSR2 signal for nodemon shutdown
        process.once("SIGUSR2", () => {
            mongoose.connection.close(() => {
                winston.info("Mongoose disconnected through nodemon restart");
                process.kill(process.pid, "SIGUSR2");
            });
        });
        // SIGINT signal for regular app shutdown
        process.on("SIGINT", () => {
            mongoose.connection.close(() => {
                winston.info("Mongoose disconnected through app termination");
                process.exit(0);
            });
        });
        // SIGTERM signal for Heroku shutdown
        process.on("SIGTERM", () => {
            mongoose.connection.close(() => {
                winston.info("Mongoose disconnected through Heroku app shutdown");
                process.exit(0);
            });
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map