import { User, CreateUserPayload } from "./../model/user"
import { Request, Response } from 'express';
import { ObjectId } from "bson";



interface Service {
    createUser: (user: User) => void
}

var service: Service


export default class Controller {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/users/", this.createUser)
    }

    createUser(req: Request, resp: Response) {
        try {
            var payload: CreateUserPayload = new CreateUserPayload(req.body)
            var user: User = payload.toUser()
            service.createUser(user)
            resp.contentType("json")
            resp.send(user.toJSONString())

        } catch (error) {
            console.log(error)
        }
    }
}