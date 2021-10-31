import { User, CreateUserPayload, UserPayload } from "../model/user"
import { Request, Response } from 'express';
import query,{ QueryFunc } from "../model/query";



interface Service {
    createUser(payload: CreateUserPayload): Promise<User | undefined>
    getUserList(...queries: QueryFunc[]): Promise<User[] | undefined>
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
            resp.json(user?.toPayload())
        }).catch((err) => {
            resp.send(err)
        })

    }

    getUserList(req: Request, resp: Response) {
        service.getUserList(query.httpRequestQuery(req)).then((users) => {
            var payload : UserPayload[] = []
            users?.map((user)=>{
                payload.push(user.toPayload())
            })
            resp.json(payload)            

        })
    }

}

