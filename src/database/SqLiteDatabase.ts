import {CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from "@capacitor-community/sqlite";
import {Capacitor} from "@capacitor/core";

class SqLiteDatabase {
    private static dbname = "MyTilesDB";
    private static sqlite: SQLiteConnection | null = null;
    private static db: SQLiteDBConnection | null = null;

    public static connect() {
        return SqLiteDatabase.init();
    }

    public static getDB() {
        return SqLiteDatabase.db;
    }

    public static getDatabaseName() {
        return SqLiteDatabase.dbname;
    }

    private static init() {
        let sqlite: SQLiteConnection | null = null;

        return new Promise<boolean >((resolve) => {
            const dbReady = (db: SQLiteDBConnection) => {
                db.open().then(()=> {
                    SqLiteDatabase.db  = db;
                    resolve(true);
                }, ()=>{
                    resolve(false);
                })
            }
            const dbFail = () => {
                resolve(false);
            }
            const platform = Capacitor.getPlatform();
            if (platform === "web") {
                console.log("Fail: Web not supported")
                dbFail();
                return;
            }
            sqlite = new SQLiteConnection(CapacitorSQLite);
            SqLiteDatabase.sqlite = sqlite;
            if (sqlite === null) {
                console.log("Fail: this.sqlite = new SQLiteConnection(CapacitorSQLite)")
                dbFail();
            } else {
                sqlite.checkConnectionsConsistency().then(ret => {
                    sqlite?.isConnection(SqLiteDatabase.dbname).then((val)=> {
                        const isConn = val.result;
                        if (ret.result && isConn) {
                            sqlite?.retrieveConnection(SqLiteDatabase.dbname).then( db => {
                                dbReady(db);
                            }, dbFail);
                        } else {
                            sqlite?.createConnection(SqLiteDatabase.dbname, false, "no-encryption", 1).then( db => {
                                dbReady(db);
                            }, dbFail);
                        }
                    }, dbFail);
                }, (err) => {
                    console.log("Fail: Consistency check", err)
                    dbFail();
                });
            }
        })
    }

    disconnect() {
        return new Promise<boolean>(resolve => {
            if (SqLiteDatabase.db) {
                SqLiteDatabase.db.close().finally(()=>{
                    SqLiteDatabase.sqlite?.closeConnection(SqLiteDatabase.dbname).finally(()=> {
                        resolve(true)
                    });
                });
                SqLiteDatabase.db = null;
            }
        })
    }
}

export default SqLiteDatabase;