import { User, CreateUserPayload, UserPayload, UpdateUserPayload } from "../model/user"
import { NextFunction, Request, Response } from 'express';
import query, { QueryFunc } from "../model/query";
import customerror from "../model/customerror";
import { RestResponse } from "../model/rest";
import { RoleAccess } from "../model/role";



interface Service {
    createUser(payload: CreateUserPayload): Promise<User | undefined>
    updateUser(payload: UpdateUserPayload): Promise<void>
    getUserList(...queries: QueryFunc[]): Promise<User[] | undefined>
    getUser(id: any): Promise<User | undefined>
    deleteUser(id: any): Promise<void>
    invalidateRefreshToken(userIdOrToken: string): Promise<void>
}

interface Middleware {
    authenticate(requiredAccess?: RoleAccess): (req: Request, resp: Response, next: NextFunction) => void
}


var service: Service

var middleware: Middleware

export default class UserController {
    constructor(srv: Service, mw: Middleware) {
        service = srv
        middleware = mw
    }

    mount(app: any) {
        app.post("/users/", middleware.authenticate(RoleAccess.CreateUser), this.createUser)
        app.get("/users/", middleware.authenticate(RoleAccess.ReadUserList), this.getUserList)
        app.get("/users/:id", middleware.authenticate(RoleAccess.ReadUser), this.getUser)
        app.get("/users/me/user", middleware.authenticate(), this.getMe)
        app.put("/users/:id", middleware.authenticate(RoleAccess.UpdateRole), this.updateUser)
        app.delete("/users/:id", middleware.authenticate(RoleAccess.DeleteUser), this.deleteUser)


        app.patch("/users/:id/refreshtoken/invalidate", middleware.authenticate(RoleAccess.InvalidateRefreshToken), this.invalidateRefreshToken("id"))
        app.patch("/users/refreshtoken/:token/invalidate/", middleware.authenticate(RoleAccess.InvalidateRefreshToken), this.invalidateRefreshToken("token"))

    }

    async createUser(req: Request, resp: Response) {
        try {
            var payload: CreateUserPayload = new CreateUserPayload(req.body)
            var user = await service.createUser(payload)
            new RestResponse(200, "", user?.toPayload()).json(resp)
        } catch (err: any) {
            switch (err) {
                case customerror.userEmailExistsError:
                    new RestResponse(409, "", null, err).json(resp)
                    break;
                case customerror.invalidPayload:
                    new RestResponse(400, "bad request", null, err).json(resp)
                    break;
                default:
                    console.log(err)
                    new RestResponse(500, "create user failed", null, err).json(resp)
            }
        }

    }

    getUserList(req: Request, resp: Response) {
        service.getUserList(query.httpRequestQuery(req), query.searchQuery("name", "email")).then((users) => {
            var payload: UserPayload[] = []
            users?.forEach((user) => {
                payload.push(user.toPayload())
            })
            new RestResponse(200, "", payload).json(resp)
        }).catch((err) => {
            switch (err) {
                default:
                    console.log(err)
                    new RestResponse(500, "get user list failed", null, err).json(resp)
            }
        })
    }

    getUser(req: Request, resp: Response) {
        var id = req.params.id
        service.getUser(id).then((user) => {
            if (!user) throw customerror.notFoundError
            new RestResponse(200, "", user.toPayload()).json(resp)
        }).catch((err) => {
            switch (err) {
                case customerror.notFoundError:
                    new RestResponse(404, "user not found", null, err).json(resp)
                    break;
                default:
                    console.log(err)
                    new RestResponse(500, "get user list failed", null, err).json(resp)
            }
        })
    }

    getMe(req: Request, resp: Response) {
        var user : User = req["locals"].user
        new RestResponse(200, "",user.toPayload()).json(resp)
    }

    deleteUser(req: Request, resp: Response) {
        var id = req.params.id
        service.deleteUser(id).then(() => {
            new RestResponse(200, "User deleted",).json(resp)
        }).catch((err) => {
            switch (err) {
                case customerror.notFoundError:
                    resp.status(404)
                    new RestResponse(404, "user not found or had been deleted", null).json(resp)
                    break;
                default:
                    resp.status(500)
                    new RestResponse(500, "get user list failed", null).json(resp)
            }
        })

    }

    async updateUser(req: Request, resp: Response) {
        try {
            var id = req.params.id
            var payload: UpdateUserPayload = new UpdateUserPayload(id, req.body)
            await service.updateUser(payload)
            new RestResponse(200, "Successfully updated").json(resp)
        } catch (err: any) {
            switch (err) {
                case customerror.userEmailExistsError:
                    new RestResponse(409, "", null, err).json(resp)
                    break;
                case customerror.invalidPayload:
                    new RestResponse(400, "bad request", null, err).json(resp)
                    break;
                case customerror.notFoundError:
                    new RestResponse(404, "user not found", null, err).json(resp)
                    break;
                default:
                    console.log(err)
                    new RestResponse(500, "create user failed", null, err).json(resp)
            }
        }
    }

    invalidateRefreshToken(param: string) {
        return (req: Request, resp: Response) => {
            if (param != "token" && param != "id") throw "invalid field"
            var idOrToken = req.params[param]
            service.invalidateRefreshToken(idOrToken).then(() => {
                new RestResponse(200, "Refresh token invalidated!").json(resp)
            }).catch((err) => {
                switch (err) {
                    case customerror.notFoundError:
                        new RestResponse(404, "falied to invalidate token", null, err).json(resp)
                        break
                    default:
                        new RestResponse(500, "falied to invalidate token").json(resp)
                }
            })
        }
    }
}

