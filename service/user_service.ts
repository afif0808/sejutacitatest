import { ObjectId } from 'bson'
import { CreateUserPayload, User } from '../model/user'
import query, { QueryFunc } from "../model/query"
import customerror from '../model/customerror'



interface Repository {
    insertUser(user: User): void
    getUserList(...queries: QueryFunc[]): Promise<User[] | undefined>
    getUser(query: QueryFunc, ...queries: QueryFunc[]): Promise<User | undefined>
}

var repository: Repository

export default class UserService {
    constructor(repo: Repository) {
        repository = repo
    }
    async createUser(payload: CreateUserPayload): Promise<User | undefined> {
        try {
            var existing = await repository.getUser(query.emailFilterQuery(payload.email))
            if (existing) throw customerror.userEmailExistsError

            var user: User = payload.toUser()
            repository.insertUser(user)
            return user
        } catch (err) {
            throw err
        }
    }
    async getUserList(...queries: QueryFunc[]): Promise<User[] | undefined> {
        try {
            return repository.getUserList(...queries)
        } catch (err) {
            throw err
        }
    }

    async getUser(id: any): Promise<User | undefined> {
        try {
            var user = repository.getUser(query.idFilterQuery(id))
            return user
        } catch (err) {
            throw err
        }
    }

}