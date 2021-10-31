import { ObjectId } from "bson";
var bcrypt = require("bcrypt")


class User {
    declare _id: ObjectId
    declare name: string
    declare email: string
    declare password: string
    declare passwordSalt: string
    constructor() {

    }


    toJSONString(): string {
        var json: any = JSON.parse(JSON.stringify(this))
        delete json["password"]
        delete json["passwordSalt"]
        json = JSON.stringify(json)
        json = json.replace("_id", "id")
        return json
    }
}

class CreateUserPayload {
    declare name: string
    declare email: string
    declare password: string

    constructor(payload: any) {
        this.name = payload.name
        this.email = payload.email
        this.password = payload.password
    }

    toUser(): User {
        var user: User = new User()
        user._id = new ObjectId()
        user.name = this.name
        user.email = this.email
        try {
            user.passwordSalt = bcrypt.genSaltSync(10)
            user.password = bcrypt.hashSync(this.password, user.passwordSalt)
        } catch (err) {
            throw err
        }
        return user
    }

}







export { User, CreateUserPayload }