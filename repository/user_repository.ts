import { Db, FindOptions } from "mongodb";
import { User } from "../model/user";
import { QueryFunc } from "../model/query";
const collectionName: string = "users"
var dbInstance: Db
class UserMongoRepository {
    constructor(db: Db) {
        dbInstance = db
    }
    async insertUser(user: User) {
        try {
            var collection = dbInstance.collection(collectionName)
            var obj: any = user
            obj._id = obj.id
            await collection.insertOne(obj)
            delete obj["_id"]
        } catch (err) {
            throw err
        }

    }

    applyListQuery(queries: QueryFunc[]): {} {
        var query = {
            filter: {},
            pagination: {}
        }

        queries.forEach((callback) => {
            callback(query)
        })

        var skip: any = query.pagination["page"] > 0 && query.pagination["page"] - 1
        skip = skip * query.pagination["limit"]

        Object.assign(query.pagination, { "skip": skip })

        return query
    }

    async getUserList(...queries: QueryFunc[]): Promise<User[] | undefined> {

        try {
            var query: any = this.applyListQuery(queries)
            var users: User[] = []

            var result = await dbInstance.collection(collectionName).find(query.filter, query.pagination).toArray()
            result?.map((el) => {
                var user: User = new User()
                user.id = el._id
                Object.keys(el).forEach((k) => {
                    user[k] = el[k]
                })
                users.push(user)
            })

        } catch (err) {
            throw err
        }
        return users
    }
    async getUser(queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined> {
        try {
            var query = {
                filter: {},
                pagination: {}
            }

            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            var result = await dbInstance.collection(collectionName).findOne(query.filter)
            if (!result) return undefined
            var user = new User()
            user.id = result._id
            Object.keys(result).forEach((k,v) => { user[k] = result && result[k] })
            return user
        }
        catch (err) {
            throw err
        }
    }


}

export { UserMongoRepository }