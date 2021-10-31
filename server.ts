import { Db, MongoClient } from "mongodb"
import UserController from "./controller/user_controller"
import { UserMongoRepository } from "./repository/user_repository"
import UserService from "./service/user_service"


const initDB = async (): Promise<Db> => {
    var host = process.env.MONGODB_DOCKER_HOST || process.env.MONGODB_HOST
    var port = process.env.MONGODB_PORT
    var dbName = process.env.MONGODB_DB_NAME
    var url = 'mongodb://' + host + ':/' + port
    const client = new MongoClient(url);
    var conn = await client.connect();
    return new Promise<Db>((resolve) => {
        resolve(conn.db(dbName));
    });
};



async function initApp() {
    require('dotenv').config();
    var express = require('express')
    var app = express()
    app.use(express.json())
    var db = await initDB()

    var userMongoRepo = new UserMongoRepository(db)
    var userService = new UserService(userMongoRepo)
    var userController = new UserController(userService)
    userController.mount(app)

    // NOTE : resource cleanup

    var port = process.env.APP_PORT || 3000
    app.listen(port, function () {
        console.log("Server started on port :" + port)
    })
}

initApp()






