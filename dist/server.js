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
const user_controller_1 = __importDefault(require("./controller/user_controller"));
const user_repository_1 = require("./repository/user_repository");
const user_service_1 = __importDefault(require("./service/user_service"));
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
        var userMongoRepo = new user_repository_1.UserMongoRepository(db);
        var userService = new user_service_1.default(userMongoRepo);
        var userController = new user_controller_1.default(userService);
        userController.mount(app);
        // NOTE : resource cleanup
        var port = process.env.APP_PORT || 3000;
        app.listen(port, function () {
            console.log("Server started on port :" + port);
        });
    });
}
initApp();
