import { URLSearchParams } from 'url';
import { Request } from 'express';

interface Query {
    filter: {}
    pagination: {}
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
            urlQuery.forEach((v,k)=>{
                if (k == "limit" || k == "page") {
                    query.pagination[k] = parseInt(v)
                    return
                }
                query.filter[k] = v
            })
        }
    }
}

export { QueryFunc }
