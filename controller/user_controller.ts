import { User, CreateUserPayload } from "../model/user"
import { Request, Response } from 'express';



interface Service {
    createUser(payload: CreateUserPayload): Promise<User | undefined>
    getUserList(): Promise<User[] | undefined>
}

var service: Service


export default class UserController {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/users/", this.createUser)
        app.get("/users/", this.getUserList)
    }

    createUser(req: Request, resp: Response) {
        var payload: CreateUserPayload = new CreateUserPayload(req.body)
        service.createUser(payload).then((user) => {
            resp.contentType("json")
            resp.send(user?.toJSONString())
        }).catch((err) => {
            resp.send(err)
        })

    }

    getUserList(req: Request, resp: Response) {
        service.getUserList().then((users) => {
            var json: any = users?.map((user) => {
                return user.toJSONString()
            })
            json = "[" + json.join(",") + "]"
            resp.contentType("json")
            resp.send(json)
        })
    }

}

