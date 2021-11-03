import { initMongoDB } from "./database"
import { Role, RoleAccess } from "./model/role"
import { User } from "./model/user"
var bcrypt = require("bcrypt")


async function generateDefaultData() {
    var db = await initMongoDB()

    var passwordSalt = "$2b$10$UlNgVCHiZP7w/4JaGoDMBe"

    var adminRole: any = new Role()
    adminRole._id = "618067afd961eb785b11d35b"
    adminRole.name = "Admin"
    adminRole.accesses = Object.values(RoleAccess)

    var john: any = new User()
    john._id = "61809efb4a28b7327dc93b69"
    john.name = "John"
    john.email = "john@mail.com"
    john.passwordSalt = passwordSalt
    john.password =  bcrypt.hashSync("123456",passwordSalt)
    john.roleId = "618067afd961eb785b11d35b"

    db.collection("users").updateOne({ "_id": john._id }, { $set: john }, { upsert: true })
    db.collection("roles").updateOne({ "_id": adminRole._id }, { $set: adminRole }, { upsert: true })


    var userRole: any = new Role()
    userRole._id = "6181bc8df024cf6b6fc2dfec"
    userRole.name = "User"
    userRole.accesses = []

    var doe: any = new User()
    doe._id = "6181df0405b67bf174cde343"
    doe.name = "Doe"
    doe.email = "doe@mail.com"
    doe.passwordSalt = passwordSalt
    doe.password =  bcrypt.hashSync("123456",passwordSalt)
    doe.roleId = "6181bc8df024cf6b6fc2dfec"

    db.collection("users").updateOne({ "_id": doe._id }, { $set: doe }, { upsert: true })
    db.collection("roles").updateOne({ "_id": userRole._id }, { $set: userRole }, { upsert: true })
}

export { generateDefaultData }