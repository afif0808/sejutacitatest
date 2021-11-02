import { LoginPayload, Token } from "../model/auth";
import { Request, Response } from "express"
import { RestResponse } from "../model/rest";
import customerror from "../model/customerror";

interface Service {
    logIn(payload: LoginPayload): Promise<Token>
}

var service: Service

export default class AuthController {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/auth/login/", this.logIn)
    }

    async logIn(req: Request, resp: Response) {
        try {
            var payload = new LoginPayload(req.body)
            var token = await service.logIn(payload)
            new RestResponse(200, "", token).json(resp)
        } catch (err: any) {
            switch (err) {
                case customerror.notFoundError:
                case customerror.passwordInvalidError:
                    new RestResponse(401, "Unauthorized", null, err).json(resp)
                    break;
                case customerror.invalidPayload:
                    new RestResponse(400, "bad request", null, err).json(resp)
                    break;
                default:
                    new RestResponse(500, "login failed", null, err).json(resp)
            }
        }

    }

}

