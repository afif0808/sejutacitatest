import customerror from "../model/customerror";
import { LoginPayload } from "../model/login";
import query, { QueryFunc } from "../model/query";
import { User } from "../model/user";
import { default as jwt } from "jsonwebtoken"
var bcrypt = require("bcrypt")

interface Repository {
    getUser(query: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined>
}


export default class AuthService {
    declare repo: Repository

    constructor(repo: Repository) {
        this.repo = repo
    }
    async logIn(payload: LoginPayload): Promise<string> {
        try {
            var user = await this.repo.getUser(query.emailFilterQuery(payload.identifier))
            if (!user) throw customerror.notFoundError
            var hash = bcrypt.hashSync(payload.password, user.passwordSalt)
            var passwordValid = hash == user.password
            if (!passwordValid) throw customerror.passwordInvalidError
            var jwtSecretKey = process.env.JWT_SECRET_KEY || "s3cr3tk3y"
            var token = jwt.sign({ user: user, expiresIn: 60 * 60 * 24 }, jwtSecretKey)
            return token
        } catch (err) {
            throw err
        }
    }
}