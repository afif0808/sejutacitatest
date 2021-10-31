import { ObjectId } from 'bson'
import { User } from '../model/user'

interface Repository {
    insertUser(user: User): void
    getUserList(): Promise<User[] | undefined>
}

var repository: Repository

export default class UserService {
    constructor(repo: Repository) {
        repository = repo
    }
    createUser(user: User) {
        try {
            repository.insertUser(user)
        } catch (err) {
            throw err
        }
    }
    getUserList(): Promise<User[] | undefined> {
        try {
            return repository.getUserList()
        } catch (err) {
            throw err
        }
    }

}