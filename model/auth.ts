import { Schema, Validator } from "jsonschema"
import customerror from "./customerror"

class LoginPayload {
    declare identifier: string // e.g : email or username
    declare password: string

    schema: Schema = {
        type: "object",
        properties: {
            identifier: { type: "string" },
            password: { type: "string" }
        },
        required: ["identifier", "password"]
    }

    constructor(payload?: any) {
        if (!payload) return
        var validator = new Validator()
        var errors = validator.validate(payload, this.schema).errors
        if (errors.length > 0) throw customerror.invalidPayload
        this.identifier = payload.identifier
        this.password = payload.password
    }
}

class Token {
    declare accessToken: string
    declare refreshToken: string

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }
}







export { LoginPayload , Token }


