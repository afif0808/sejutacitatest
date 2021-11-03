import { Request, Response, NextFunction } from "express"
import customerror from "../model/customerror"
import { RestResponse } from "../model/rest"
import { Role, RoleAccess } from "../model/role"
import { User } from "../model/user"

interface Service {
    authenticate(token: string, requiredAccess?: RoleAccess): User
}

var service: Service


export default class AuthMiddleware {
    constructor(srv: Service) {
        service = srv
    }
    // ACL-like authenticate middleware
    authenticate(requiredAccess?: RoleAccess) {
        return (req: Request, resp: Response, next: NextFunction) => {
            try {
                var token = req.header("authorization")

                if (!token || !token.includes("Bearer ")) throw customerror.unauthorizedError
                token = token.replace("Bearer ", "")
                var user: User = service.authenticate(token,requiredAccess)
                if (user.role) {
                    user.role = Object.assign(new Role(),user.role)
                }
                req["locals"] = { user: user }
                next()
            } catch (err) {
                switch (err) {
                    case customerror.unauthorizedError:
                        new RestResponse(401, "Unauthorized", null).json(resp)
                        break
                }
                return
            }
        }
    }
}