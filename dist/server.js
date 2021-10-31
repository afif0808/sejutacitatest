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
const mongodb_1 = require("mongodb");
const controller_1 = __importDefault(require("./controller/controller"));
const mongo_repository_1 = __importDefault(require("./repository/mongo_repository"));
const service_1 = __importDefault(require("./service/service"));
const initDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var host = process.env.MONGODB_DOCKER_HOST || process.env.MONGODB_HOST;
    var port = process.env.MONGODB_PORT;
    var dbName = process.env.MONGODB_DB_NAME;
    var url = 'mongodb://' + host + ':/' + port;
    const client = new mongodb_1.MongoClient(url);
    var conn = yield client.connect();
    return new Promise((resolve) => {
        resolve(conn.db(dbName));
    });
});
function initApp() {
    return __awaiter(this, void 0, void 0, function* () {
        require('dotenv').config();
        var express = require('express');
        var app = express();
        app.use(express.json());
        var db = yield initDB();
        var repo = new mongo_repository_1.default(db);
        var service = new service_1.default(repo);
        var controller = new controller_1.default(service);
        controller.mount(app);
        // NOTE : resource cleanup
        var port = 435;
        app.listen(port, function () {
            console.log("Server started on port :" + port);
        });
    });
}
initApp();
