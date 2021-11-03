import { Db, FindOptions } from "mongodb";
import { Role } from "../model/role";
import { Query, QueryFunc } from "../model/query";
import customerror from "../model/customerror";
import { MongoDB } from "../database";

const collectionName: string = "roles"
class RoleMongoRepository {
    declare db: MongoDB
    constructor(db: MongoDB) {
        this.db = db
    }
    async insertRole(role: Role) {
        try {
            var collection = this.db.writeConn.collection(collectionName)
            var obj: any = { ...role }
            obj._id = obj.id
            delete obj["id"]
            obj.accesses = obj.accesses
            await collection.insertOne(obj)

        } catch (err) {
            throw err
        }
    }


    applyListQuery(queries: QueryFunc[]): Query {
        var query: Query = new Query

        queries.forEach((callback) => {
            callback(query)
        })

        var skip: any = query.pagination["page"] > 0 && query.pagination["page"] - 1
        skip = skip * query.pagination["limit"]

        Object.assign(query.pagination, { "skip": skip })

        return query
    }

    async getRoleList(...queries: QueryFunc[]): Promise<Role[] | undefined> {

        try {
            var query: Query = this.applyListQuery(queries)
            var roles: Role[] = []

            var result = await this.db.readConn.collection(collectionName).find(query.filter, query.pagination).toArray()
            result?.map((el) => {
                var role: Role = new Role()
                role.id = el._id
                Object.keys(el).forEach((k) => {
                    role[k] = el[k]
                })
                roles.push(role)
            })

        } catch (err) {
            throw err
        }
        return roles
    }
    async getRole(queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<Role | undefined> {
        try {
            var query: Query = new Query()

            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })
            if (query.filter["id"])
                delete Object.assign(query.filter, { _id: query.filter["id"] })["id"]
            console.log(query)
            var result = await this.db.readConn.collection(collectionName).findOne(query.filter)
            if (!result) return undefined
            var role = new Role()
            role.id = result._id
            Object.keys(result).forEach((k, v) => { role[k] = result && result[k] })
            return role
        }
        catch (err) {
            throw err
        }
    }


    async updateRole(role: Role, queryFunc: QueryFunc, ...queries: QueryFunc[]) {
        try {
            var query: Query = new Query
            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            if (query.filter["id"])
                delete Object.assign(query.filter, { _id: query.filter["id"] })["id"]

            var obj: any = role

            delete obj["id"]

            for (let k in obj) {
                if (obj[k] == undefined) {
                    delete obj[k]
                }
            }
            console.log(query)
            var result = await this.db.writeConn.collection(collectionName).updateMany(query.filter, { "$set": obj })
            if (result.matchedCount < 1) {
                throw customerror.notFoundError
            }

        } catch (err) {
            throw err
        }
    }

}

export { RoleMongoRepository }