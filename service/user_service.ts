import { ObjectId } from 'bson'
import { CreateUserPayload, UpdateUserPayload, User } from '../model/user'
import query, { Query, QueryFunc } from "../model/query"
import customerror from '../model/customerror'
import { Role } from '../model/role'
var bcrypt = require("bcrypt")




interface UserRepository {
    insertUser(user: User): void
    getUserList(...queries: QueryFunc[]): Promise<User[] | undefined>
    getUser(query: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined>
    deleteUser(queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<void>
    updateUser(user: User, queryFunc: QueryFunc, ...queries: QueryFunc[]): Promise<void>

}


export default class UserService {
    declare userRepo: UserRepository
    constructor(userRepo: UserRepository) {
        this.userRepo = userRepo
    }
    async createUser(payload: CreateUserPayload): Promise<User | undefined> {
        try {
            var existing = await this.userRepo.getUser(query.emailFilterQuery(payload.email))
            if (existing) throw customerror.userEmailExistsError
            var user: User = payload.toUser()
            this.userRepo.insertUser(user)
            return user
        } catch (err) {
            throw err
        }
    }
    async getUserList(...queries: QueryFunc[]): Promise<User[] | undefined> {
        try {
            var users = await this.userRepo.getUserList(...queries)
            return users
        } catch (err) {
            throw err
        }
    }

    async getUser(id: any): Promise<User | undefined> {
        console.log(id)
        try {
            return this.userRepo.getUser(query.idFilterQuery(id))
        } catch (err) {
            throw err
        }
    }
    async deleteUser(id: any) {
        return this.userRepo.deleteUser(query.idFilterQuery(id))
    }

    async updateUser(payload: UpdateUserPayload): Promise<void> {
        try {
            var existing = await this.getUser(payload.id)
            if (!existing) throw customerror.notFoundError

            if (payload.email != existing.email) {
                let existing = await this.userRepo.getUser(query.emailFilterQuery(payload.email))
                if (existing) throw customerror.userEmailExistsError
            }

            existing.name = payload.name
            existing.email = payload.email
            existing.roleId = payload.roleId

            if (payload.password) existing.password = bcrypt.hashSync(payload.password, existing.passwordSalt)


            await this.userRepo.updateUser(existing, query.idFilterQuery(existing.id))
        }
        catch (err) {
            throw err
        }
    }

    async invalidateRefreshToken(userIdOrToken: string): Promise<void> {
        try {
            var queryFunc = (query: Query) => {
                query.filter["$or"] = [{ _id: userIdOrToken }, { refreshToken: userIdOrToken }]
            }
            var user = new User()
            user.refreshToken = ""
            await this.userRepo.updateUser(user, queryFunc)
        } catch (err) {
            throw err
        }
    }


}