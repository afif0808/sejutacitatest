import { Db, Logger, LoggerLevel, MongoClient } from "mongodb"
import AuthController from "./controller/auth_controller";
import RoleController from "./controller/role_controller";
import UserController from "./controller/user_controller"
import { MongoDB } from "./database";
import { generateDefaultData } from "./data_seed";
import AuthMiddleware from "./middleware/auth_middleware";
import { RoleMongoRepository } from "./repository/role_repository";
import { UserMongoRepository } from "./repository/user_repository"
import AuthService from "./service/auth_service";
import RoleService from "./service/role_service";
import UserService from "./service/user_service"
import { Request, Response, NextFunction } from "express"

async function initService(app: any) {
    var db = new MongoDB()
    await db.connect()

    var userMongoRepo = new UserMongoRepository(db)
    var roleMongoRepo = new RoleMongoRepository(db)

    var userService = new UserService(userMongoRepo, roleMongoRepo)
    var authService = new AuthService(userMongoRepo)
    var roleService = new RoleService(roleMongoRepo)


    var authMiddleware = new AuthMiddleware(authService)

    var authController = new AuthController(authService)
    var userController = new UserController(userService, authMiddleware)
    var roleController = new RoleController(roleService, authMiddleware)


    userController.mount(app)
    authController.mount(app)
    roleController.mount(app)


}


async function initApp() {
    require('dotenv').config();
    var express = require('express')
    var app = express()
    app.use(express.json())

    await generateDefaultData()


    initService(app)

  

    var port = process.env.APP_PORT || 3000
    app.listen(port, function () {
        console.log("Server started on port :" + port)
    })
}

initApp()






