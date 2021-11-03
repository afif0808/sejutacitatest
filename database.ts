import { Db, MongoClient } from "mongodb";

const initMongoDB = async (): Promise<Db> => {
    var host = process.env.MONGODB_DOCKER_HOST || process.env.MONGODB_HOST
    var port = process.env.MONGODB_PORT
    var dbName = process.env.MONGODB_DB_NAME
    var url = 'mongodb://' + host + ':/' + port
    const client = new MongoClient(url);
    var conn = await client.connect();
    return new Promise<Db>((resolve) => {
        resolve(conn.db(dbName));
    });
};



class MongoDB {
    declare readConn: Db
    declare writeConn: Db

    async connect() {
        this.readConn = await initMongoDB()
        this.writeConn = await initMongoDB()
    }
}

export { MongoDB, initMongoDB }
