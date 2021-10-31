interface QueryFunc { (): {} }

export default {
    idFilterQuery: (id: any): QueryFunc => {
        return (): {} => {
            return { id: id }
        }
    },
    emailFilterQuery : (email : string) : QueryFunc => {
        return (): {} => {
            return { email: email }
        }
    }
}

export { QueryFunc }
