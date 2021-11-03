import { Db, FindOptions } from "mongodb";
import { ObjectId } from "bson";

import { User } from "../model/user";
import { Query, QueryFunc } from "../model/query";
import { Role } from "../model/role";
import customerror from "../model/customerror";
import { MongoDB } from "../database";
const collectionName: string = "users"
class UserMongoRepository {
    declare db: MongoDB
    constructor(db: MongoDB) {
        this.db = db
    }
    async insertUser(user: User) {
        try {
            var collection = this.db.readConn.collection(collectionName)
            var obj: any = { ...user }
            obj._id = obj.id
            delete obj["id"]
            await collection.insertOne(obj)
        } catch (err) {
            throw err
        }

    }

    applyListQuery(queries: QueryFunc[]) {
        var query: Query = new Query


        queries.forEach((callback) => {
            callback(query)
        })

        if (query.filter["search"]) delete Object.assign(query.filter, { "$or": query.filter["search"] })["search"]


        if (!query.filter["page"]) return query
        query.filter["page"] -= 1
        Object.assign(query.pagination, { "skip": query.filter["page"] })


        return query
    }

    async getUserList(...queries: QueryFunc[]): Promise<User[] | undefined> {
        try {
            var query: Query = this.applyListQuery(queries)
            console.log(query)
            var users: User[] = []
            var result = await this.db.readConn.collection(collectionName).
                find(query.filter, query.pagination).toArray()
            result?.map((el) => {
                var user: User = new User()
                user.id = el._id
                Object.keys(el).forEach((k) => {
                    user[k] = el[k]
                })
                users.push(user)
            })
            for (let i = 0; i < users.length; i++) {
                var doc = await this.db.readConn.collection("roles").findOne({ _id: users[i].roleId })
                if (!doc) continue
                var role = new Role()
                role.id = doc._id
                role.name = doc.name
                role.accesses = doc.accesses
                users[i].role = role
            }
            return users
        } catch (err) {

            throw err
        }
    }
    async getUser(queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined> {
        try {
            var query: Query = new Query


            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            if (query.filter["id"])
                delete Object.assign(query.filter, { _id: query.filter["id"] })["id"]
            var result = await this.db.readConn.collection(collectionName).findOne(query.filter)

            if (!result) return undefined
            var user = new User()
            user.id = result._id
            Object.keys(result).forEach((k, v) => { user[k] = result && result[k] })

            var doc = await this.db.readConn.collection("roles").findOne({ _id: user.roleId })
            if (!doc) return user

            user.role = new Role()
            user.role.id = doc._id
            user.role.name = doc.name
            user.role.accesses = doc.accesses

            return user
        }
        catch (err) {
            throw err
        }
    }
    async deleteUser(queryFunc: QueryFunc, ...queries: QueryFunc[]) {
        try {
            var query: Query = new Query

            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            if (query.filter["id"])
                delete Object.assign(query.filter, { _id: query.filter["id"] })["id"]



            var result = await this.db.writeConn.collection(collectionName).deleteMany(query.filter)
            if (result.deletedCount < 1) {
                throw customerror.notFoundError
            }

        } catch (err) {
            throw err
        }
    }

    async updateUser(user: User, queryFunc: QueryFunc, ...queries: QueryFunc[]) {
        try {
            var query: Query = new Query
            queryFunc(query)
            queries.forEach((callback) => {
                callback(query)
            })

            if (query.filter["id"])
                delete Object.assign(query.filter, { _id: query.filter["id"] })["id"]

            var obj: any = user

            delete obj["id"]
            delete obj["role"]

            for (let k in obj) {
                if (obj[k] == undefined) {
                    delete obj[k]
                }
            }
            var result = await this.db.writeConn.collection(collectionName).updateMany(query.filter, { "$set": obj })
            if (result.matchedCount < 1) {
                throw customerror.notFoundError
            }

        } catch (err) {
            throw err
        }
    }


}

export { UserMongoRepository }