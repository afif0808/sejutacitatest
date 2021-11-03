import { LoginPayload, Token } from "../model/auth";
import { Request, Response } from "express"
import { RestResponse } from "../model/response";
import customerror from "../model/customerror";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

interface Service {
    logIn(payload: LoginPayload): Promise<Token>
    refreshToken(token: string): Promise<string>
}

var service: Service

export default class AuthController {
    constructor(srv: Service) {
        service = srv
    }

    mount(app: any) {
        app.post("/auth/login/", this.logIn)
        app.post("/auth/token/refresh", this.refreshToken)

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
                    console.log(err)
                    new RestResponse(500, "login failed", null, err).json(resp)
            }
        }

    }
    async refreshToken(req: Request, resp: Response) {
        try {
            var token = req.body.refreshToken
            if (!token || typeof token != "string") throw customerror.invalidPayload
            var accessToken = await service.refreshToken(token)
            new RestResponse(200, "", { accessToken: accessToken }).json(resp)
        } catch (err: any) {
            switch (err) {
                case customerror.invalidPayload:
                    new RestResponse(400, "invalid payload", null, err).json(resp)
                    break
                case customerror.unauthorizedError:
                    new RestResponse(401, "refresh token is invalid", null, err).json(resp)
                    break
                default:
                    new RestResponse(500, "", null, err).json(resp)
            }
        }
    }
}

