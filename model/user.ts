import { ObjectId } from "bson";
var bcrypt = require("bcrypt")


class User {
    declare id: string
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

    toPayload(): UserPayload {
        var payload: UserPayload = new UserPayload()
        payload.id = this.id
        payload.name = this.name
        payload.email = this.email
        return payload
    }

}

class UserPayload {
    declare id: string
    declare name: string
    declare email: string

    constructor() {

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
        user.id = new ObjectId().toString()
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
// Update my user
class UpdateMePayload {
    declare name: string
    declare email: string
}

class UpdateUserPayload {
    declare name: string
    declare email: string
    declare roleId: string
}

class UpdatePasswordPayload {
    declare old: string
    declare new: string
}



export { User, CreateUserPayload, UserPayload }