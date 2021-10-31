import { Db } from "mongodb";
import { User } from "../model/user";

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
            return users
        } catch (err) {
            throw err
        }
    }


}

export {UserMongoRepository}