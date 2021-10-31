import { Response } from "express"
class RestResponse {
    response: any = {}
    constructor(status: number, message: string, data?: any, error?: Error) {
        this.response.success = !error
        this.response.status = status
        this.response.message = message
        this.response.data = data
        this.response.error = error
    }

    json(resp: Response) {
        resp.status(this.response.status)
        resp.json(this.response)
    }

}

export { RestResponse }



