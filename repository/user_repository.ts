import { Db } from "mongodb";
import { User } from "../model/user";
import { QueryFunc } from "../model/query";
const collectionName: string = "users"
var dbInstance: Db
class UserMongoRepository {
    constructor(db: Db) {
        dbInstance = db
    }
    insertUser(user: User) {
        var collection = dbInstance.collection(collectionName)
        collection.insertOne(user, (err, res) => {
            if (err) throw err
        })
    }
    async getUserList(): Promise<User[] | undefined> {
        try {
            var users: User[] = []
            var result = await dbInstance.collection(collectionName).find().toArray()
            result?.map((el) => {
                var user: User = new User()
                user._id = el._id
                user.email = el.email
                user.password = el.password
                user.name = el.name
                users.push(user)
            })
        } catch (err) {
            throw err
        }
        return users
    }
    async getUser(queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined> {
        try {
            var query = queryFunc()
            queries.map((q) => { query = { ...query, ...q } })
            var result = await dbInstance.collection(collectionName).findOne(query)
            if(!result) return undefined
            var user = new User()
            user._id = result?._id
            user.name = result?.name
            user.email = result?.email
            user.password = result?.password
            user.passwordSalt = result?.passwordSalt

            return user
        }
        catch (err) {
            throw err
        }
    }


}

export { UserMongoRepository }