import { Role, RoleAccess, CreateRolePayload, RolePayload } from "../model/role"
import { NextFunction, Request, Response } from 'express';
import query, { QueryFunc } from "../model/query";
import customerror from "../model/customerror";
import { RestResponse } from "../model/rest";
import { CreateUserPayload } from "../model/user";



interface Service {
    createRole(payload: CreateRolePayload): Promise<Role | undefined>
    getRoleList(...queries: QueryFunc[]): Promise<Role[] | undefined>
    getRole(id: any): Promise<Role | undefined>
}

interface Middleware {
    authenticate(requiredAccess?: RoleAccess): (req: Request, resp: Response, next: NextFunction) => void
}


var service: Service

var middleware: Middleware

export default class RoleController {
    constructor(srv: Service, mw: Middleware) {
        service = srv
        middleware = mw
    }

    mount(app: any) {
        app.post("/roles/", middleware.authenticate(RoleAccess.CreateRole), this.createRole)
        app.get("/roles/", middleware.authenticate(), this.getRoleList)
        app.get("/roles/:id", this.getRole)
        app.get("/accesses/", this.getRoleAccesses)
    }

    async createRole(req: Request, resp: Response) {
        try {
            var payload: CreateRolePayload = new CreateRolePayload(req.body)
            var role = await service.createRole(payload)
            new RestResponse(200, "", role?.toPayload()).json(resp)
        } catch (err: any) {
            switch (err) {
                case customerror.invalidPayload:
                    new RestResponse(400, "bad request", null, err).json(resp)
                    break
                default:
                    new RestResponse(500, "failed to create role", null, err).json(resp)
            }
        }
    }

    
    getRoleList(req: Request, resp: Response) {
        service.getRoleList(query.httpRequestQuery(req)).then((roles) => {
            var payload: RolePayload[] = []
            roles?.forEach((role) => {
                payload.push(role.toPayload())
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

    getRoleAccesses(req: Request, resp: Response) {
        var accesses = Object.values(RoleAccess)
        new RestResponse(200, "", accesses).json(resp)
    }


    getRole(req: Request, resp: Response) {

    }


}
