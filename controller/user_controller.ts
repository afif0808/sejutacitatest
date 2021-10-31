import { User, CreateUserPayload, UserPayload } from "../model/user"
import { Request, Response } from 'express';
import query, { QueryFunc } from "../model/query";
import customerror from "../model/customerror";
import { RestResponse } from "../model/rest";



interface Service {
    createUser(payload: CreateUserPayload): Promise<User | undefined>
    getUserList(...queries: QueryFunc[]): Promise<User[] | undefined>
    getUser(id: any): Promise<User | undefined>
}

var service: Service


export default class UserController {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/users/", this.createUser)
        app.get("/users/", this.getUserList)
        app.get("/users/:id", this.getUser)
    }

    createUser(req: Request, resp: Response) {
        var payload: CreateUserPayload = new CreateUserPayload(req.body)
        service.createUser(payload).then((user) => {
            new RestResponse(200, "", user?.toPayload()).json(resp)
        }).catch((err) => {
            switch (err) {
                case customerror.userEmailExistsError:
                    new RestResponse(409, "", null, err).json(resp)
                    break;
                default:
                    new RestResponse(500, "create user failed", null, err).json(resp)
            }
        })

    }

    getUserList(req: Request, resp: Response) {
        service.getUserList(query.httpRequestQuery(req)).then((users) => {
            var payload: UserPayload[] = []
            users?.forEach((user) => {
                payload.push(user.toPayload())
            })
            new RestResponse(200, "", payload).json(resp)
        }).catch((err) => {
            switch (err) {
                default:
                    new RestResponse(500, "get user list failed", null, err).json(resp)
            }
        })
    }

    getUser(req: Request, resp: Response) {
        var id = req.params.id
        service.getUser(id).then((user) => {
            if (!user) throw customerror.notFoundError
            new RestResponse(200, "", user?.toPayload).json(resp)
        }).catch((err) => {
            switch (err) {
                case customerror.notFoundError:
                    resp.status(404)
                    new RestResponse(404, "user not found", null, err).json(resp)
                    break;
                default:
                    resp.status(500)
                    new RestResponse(500, "get user list failed", null, err).json(resp)
            }
        })
    }



}

