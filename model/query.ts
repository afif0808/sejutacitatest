import { URLSearchParams } from 'url';
import { Request } from 'express';

class Query {
    declare filter: {}
    declare pagination: {}
    declare option: {}

    constructor() {
        this.filter = {}
        this.pagination = {}
        this.option = {}
    }
}

interface QueryFunc { (query: Query): void }

export default {
    idFilterQuery: (id: any): QueryFunc => {
        return (query: Query) => {
            query.filter["id"] = id
        }
    },
    emailFilterQuery: (email: any): QueryFunc => {
        return (query: Query) => {
            query.filter["email"] = email
        }
    },
    httpRequestQuery: (req: Request): QueryFunc => {
        return (query: Query) => {
            var urlQuery = new URLSearchParams(req.url.split("?")[1])
            urlQuery.forEach((v, k) => {
                if (k == "limit" || k == "page") {
                    query.pagination[k] = parseInt(v)
                    return
                }
                query.filter[k] = v
            })
        }
    },
    searchQuery: (field: string, ...fields: string[]): QueryFunc => {
        return (query: Query) => {
            if (!query.filter["search"]) {
                delete query.filter["search"]
                return
            }
            var search = { "$regex": query.filter["search"] }
            var q: any = [{ [field]: search }]
            fields.forEach((f) => {
                q.push({ [f]: search })
            })
            query.filter["search"] = q
        }
    }
}

export { QueryFunc, Query }
