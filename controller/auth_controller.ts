import { LoginPayload } from "../model/login";
import { Request, Response } from "express"
import { RestResponse } from "../model/rest";
import customerror from "../model/customerror";

interface Service {
    logIn(payload: LoginPayload): Promise<string>
}

var service: Service

export default class AuthController {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/auth/login/", this.logIn)
    }

    logIn(req: Request, resp: Response) {
        var payload: LoginPayload = req.body
        service.logIn(payload).then((token) => {
            new RestResponse(200, "", { token: token }).json(resp)
        }).catch((err) => {
            switch (err) {
                case customerror.notFoundError:
                case customerror.passwordInvalidError:
                    new RestResponse(401, "Unauthorized", null, err).json(resp)
                    break;
                default:
                    new RestResponse(500, "", null, err).json(resp)
            }
        })
    }

}

