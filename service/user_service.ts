import { ObjectId } from 'bson'
import { CreateUserPayload, User } from '../model/user'
import query , {QueryFunc} from "../model/query"



interface Repository {
    insertUser(user: User): void
    getUserList(): Promise<User[] | undefined>
    getUser(query: QueryFunc , ...queries : QueryFunc[]): Promise<User | undefined>
}

var repository: Repository

export default class UserService {
    constructor(repo: Repository) {
        repository = repo
    }
    async createUser(payload: CreateUserPayload): Promise<User | undefined> {
        try {
            var existing = await repository.getUser(query.emailFilterQuery(payload.email))
            if(existing) throw "user with given email already exists"

            var user: User = payload.toUser()
            repository.insertUser(user)
            return user
        } catch (err) {
            throw err
        }
    }
    async getUserList(): Promise<User[] | undefined> {
        try {
            return repository.getUserList()
        } catch (err) {
            throw err
        }
    }

}