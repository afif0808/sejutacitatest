import { ObjectId } from 'bson'
import { CreateRolePayload, Role } from '../model/role'
import query, { QueryFunc } from "../model/query"
import customerror from '../model/customerror'



interface RoleRepository {
    insertRole(role: Role): void
    getRoleList(...queries: QueryFunc[]): Promise<Role[] | undefined>
    getRole(query: QueryFunc, ...queries: QueryFunc[]): Promise<Role | undefined>
}


export default class RoleService {
    declare roleRepo : RoleRepository
    constructor(repo: RoleRepository) {
        this.roleRepo = repo
    }
    async createRole(payload: CreateRolePayload): Promise<Role | undefined> {
        var role = payload.toRole()
        this.roleRepo.insertRole(role)
        return role
    }
    async getRoleList(...queries: QueryFunc[]): Promise<Role[] | undefined> {
        try {
            var users = await this.roleRepo.getRoleList(...queries)
            return users
        } catch (err) {
            throw err
        }
    }

    async getRole(id: any): Promise<Role | undefined> {
        return
    }

}