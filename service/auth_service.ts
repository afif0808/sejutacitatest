import customerror from "../model/customerror";
import { LoginPayload, Token } from "../model/auth";
import query, { QueryFunc } from "../model/query";
import { User } from "../model/user";
import { default as jwt } from "jsonwebtoken"
import { RoleAccess } from "../model/role";
var bcrypt = require("bcrypt")

interface Repository {
    getUser(query: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined>
    updateUser(user: User, queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<void>
}


export default class AuthService {
    declare repo: Repository
    accessTokenDuration: number = 15 // minute
    jwtSecretKey = process.env.JWT_SECRET_KEY || "s3cr3tk3y"

    constructor(repo: Repository) {
        this.repo = repo
    }

    async logIn(payload: LoginPayload): Promise<Token> {
        try {
            var user = await this.repo.getUser(query.emailFilterQuery(payload.identifier))
            if (!user) throw customerror.notFoundError

            var hash = bcrypt.hashSync(payload.password, user.passwordSalt)
            var passwordValid = hash == user.password
            if (!passwordValid) throw customerror.passwordInvalidError

            delete user.refreshToken
            var accessToken = jwt.sign({ user: user }, this.jwtSecretKey, { expiresIn: 60 * this.accessTokenDuration })

            var refreshToken = jwt.sign({ userId: user.id }, this.jwtSecretKey)
            user.refreshToken = refreshToken
            await this.repo.updateUser(user, query.idFilterQuery(user.id))

            return new Token(accessToken, refreshToken)
        } catch (err) {
            throw err
        }
    }
    authenticate(token: string, requiredAccess?: RoleAccess): User {
        try {
            console.log(token)
            var payload = jwt.verify(token, this.jwtSecretKey)
            if (!payload["user"]) throw customerror.unauthorizedError
            var user: User = new User()
            console.log(payload)
            Object.assign(user, payload["user"])
            if (!requiredAccess) {
                return user
            }

            if (!user.role) throw customerror.unauthorizedError
            for (let i in user.role.accesses) {
                if (user.role.accesses[i] == requiredAccess) {
                    return user
                }
            }
            throw customerror.unauthorizedError
        } catch (err: any) {
            if (err["name"] == "JsonWebTokenError" || err["name"] == "TokenExpiredError") {
                throw customerror.unauthorizedError
            }
            throw err
        }
    }
    async refreshToken(token: string): Promise<string> {
        try {
            var payload = jwt.verify(token, this.jwtSecretKey)
            var user = await this.repo.getUser(query.idFilterQuery(payload["userId"]))
            if (!user) throw customerror.unauthorizedError
            if (user.refreshToken != token) throw customerror.unauthorizedError
            delete user.refreshToken
            var accessToken = jwt.sign({ user: user, expiresIn: 60 * this.accessTokenDuration }, this.jwtSecretKey)
            return accessToken
        } catch (err: any) {
            if (err["name"] == "JsonWebTokenError")
                throw customerror.unauthorizedError
            throw err
        }

    }


}