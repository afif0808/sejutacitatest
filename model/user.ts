import { ObjectId } from "bson";

class User {
    declare _id: ObjectId
    declare name: string
    declare email: string
    declare password: string
    constructor() {

    }


    toJSONString(): string {
        var json: any = this
        delete json["password"]
        json = JSON.stringify(json)
        json = json.replace("_id", "id")
        return json
    }
}

class CreateUserPayload {
    declare name: string
    declare email: string
    declare password: string

    constructor(payload : any) {
        this.name = payload.name
        this.email = payload.email
        this.password = payload.password
    }

    toUser(): User {
        var user: User = new User()
        
        user._id = new ObjectId()
        user.name = this.name
        user.email = this.email
        user.password = this.password

        return user
    }

}







export { User, CreateUserPayload }