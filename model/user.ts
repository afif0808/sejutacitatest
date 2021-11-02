import { ObjectId } from "bson";
import { Schema, validate, Validator } from "jsonschema";
import customerror from "./customerror";
import { Role, RolePayload } from "./role";
var bcrypt = require("bcrypt")


class User {
    declare id: string
    declare name: string
    declare email: string
    declare password: string
    declare passwordSalt: string
    declare roleId: string
    declare role?: Role

    constructor() {

    }

    toPayload(): UserPayload {
        var payload: UserPayload = new UserPayload()
        payload.id = this.id
        payload.name = this.name
        payload.email = this.email
        payload.role = this.role?.toPayload()

        return payload
    }

}

class UserPayload {
    declare id: string
    declare name: string
    declare email: string
    declare role?: RolePayload
    constructor() {

    }
}


class CreateUserPayload {
    declare name: string
    declare email: string
    declare password: string
    declare roleId: string

    schema: Schema = {
        type: "object",
        properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            roleId: { type: "string" }

        },
        required: ["name", "email", "password", "roleId"]
    }

    constructor(payload?: any) {
        if (!payload) return
        var v = new Validator()
        var errors = v.validate(payload, this.schema).errors
        if (errors.length > 0) throw customerror.invalidPayload
        this.name = payload.name
        this.email = payload.email
        this.password = payload.password
        this.roleId = payload.roleId
    }

    toUser(): User {
        var user: User = new User()
        user.id = new ObjectId().toString()
        user.name = this.name
        user.email = this.email
        user.roleId = this.roleId
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
    declare id: string
    declare name: string
    declare email: string
    declare roleId: string
    declare password?: string
    schema: Schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            roleId: { type: "string" }
        },
        required: ["id", "name", "email", "roleId"]
    }

    constructor(id: string, payload?: any) {
        if (!payload) return
        var v = new Validator()
        var errors = v.validate(payload, this.schema).errors
        if (errors.length > 0) throw customerror.invalidPayload
        this.id = id
        this.name = payload.name
        this.email = payload.email
        this.password = payload.password
        this.roleId = payload.roleId
    }

    toUser(): User {
        var user: User = new User()
        user.name = this.name
        user.email = this.email
        user.roleId = this.roleId
        if (this.password) {
            try {
                user.passwordSalt = bcrypt.genSaltSync(10)
                user.password = bcrypt.hashSync(this.password, user.passwordSalt)
            } catch (err) {
                throw err
            }
        }
        return user
    }
}

class UpdatePasswordPayload {
    declare old: string
    declare new: string
}



export { User, CreateUserPayload, UserPayload }