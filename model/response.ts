import { Response } from "express"
class RestResponse {
    response: any = {}
    constructor(status: number, message: string, data?: any, error?: Error, meta?: any) {
        this.response.success = !error
        this.response.status = status
        this.response.message = message
        this.response.data = data
        this.response.error = error
        this.response.meta = meta
    }

    json(resp: Response) {
        resp.status(this.response.status)
        resp.json(this.response)
    }

}


class PaginationResponse {
    declare data: Array<any>
    declare totalPage: number
    declare totalRecord: number
    declare page: number
    constructor(data: Array<any>, totalPage: number, totalRecord: number, page: number) {
        this.data = data
        this.totalPage = totalPage
        this.totalRecord = totalRecord
        this.page = page
    }
}

export { RestResponse,PaginationResponse }



