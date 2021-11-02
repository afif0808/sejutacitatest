import { Db, FindOptions } from "mongodb";
import { Role } from "../model/role";
import { Query, QueryFunc } from "../model/query";

const collectionName: string = "roles"
var dbInstance: Db
class RoleMongoRepository {
    constructor(db: Db) {
        dbInstance = db
    }
    async insertRole(role: Role) {
        try {
            var collection = dbInstance.collection(collectionName)
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

            var result = await dbInstance.collection(collectionName).find(query.filter, query.pagination).toArray()
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
            var query : Query = new Query()

            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            var result = await dbInstance.collection(collectionName).findOne(query.filter)
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


}

export { RoleMongoRepository }