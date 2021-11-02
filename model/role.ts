import { ObjectId } from "bson"
import { Schema, Validator } from "jsonschema"
import customerror from "./customerror"

enum RoleAccess {
    CreateUser = "create-user",
    ReadUserList = "read-user-list",
    ReadUser = "read-user",
    UpdateUser = "update-user",
    CreateRole = "create-role",
    ReadRoleList = "read-role-list"
}


class Role {
    declare id: string
    declare name: string
    declare accesses: RoleAccess[]

    constructor() {

    }
    toPayload(): RolePayload {
        var payload = new RolePayload()
        payload.id = this.id
        payload.name = this.name
        payload.accesses = this.accesses
        return payload
    }
}

class CreateRolePayload {
    declare name: string
    declare accesses: RoleAccess[]

    schema: Schema = {
        type: "object",
        properties: {
            name: { type: "string" },
            accesses: {
                type: "array",
                items: { "type": "string" }
            },
        },
        required: ["name"]
    }

    constructor(payload?: any) {
        if (!payload) return
        var errors = new Validator().validate(payload, this.schema).errors
        if (errors.length > 0) throw customerror.invalidPayload
        this.name = payload.name
        this.accesses = payload.accesses
    }

    toRole(): Role {
        var role = new Role()
        role.id = new ObjectId().toString()
        role.accesses = this.accesses
        role.name = this.name
        return role
    }

}

class RolePayload {
    declare id : string
    declare name: string
    declare accesses: RoleAccess[]

    constructor() {

    }
}



export { Role, RoleAccess, CreateRolePayload, RolePayload }