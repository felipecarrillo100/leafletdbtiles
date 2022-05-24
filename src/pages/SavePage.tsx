import {
    IonButton,
    IonButtons, IonCol,
    IonContent,
    IonHeader, IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage, IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import './Page.css';
import SqLiteDatabase from "../database/SqLiteDatabase";
import {useRef, useState} from "react";
import {TileManager} from "../utils/TileManager";
import {DBSQLiteValues} from "@capacitor-community/sqlite";

const width = 0.005;

interface RaterTableEntry {
    name: string;
    title:string;
    description: string;
    size: number;
    minLevel: number;
    maxLevel: number;
    bounds: number[];
}


const SavePage: React.FC = () => {

    const pageName = "Save";
    const tileManager = useRef(null as TileManager | null);
    const domainIndex = useRef(0);

    const [inputs, setInputs] = useState({
        x1: -118.32670428784138 - width,
        y1: 34.10164883043099 - width,
        x2: -118.32670428784138 + width,
        y2: 34.10164883043099 + width,
        availableLevels: 20,
        zoomRange: [0,0],
        levels: 5,
        tableName: "wmtssample",
        label: "wmtssample"
    });

    const [totalTiles, setTotalTiles] = useState("0");
    const [subdomains, setSubdomains]  = useState(["a", "b", "c"]);
    const [url, setUrl]  = useState("https://sampleservices.luciad.com/wmts");

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (SqLiteDatabase.getDB()) {
            const range = calculate();
            if (range) {
                const newTableEntry: RaterTableEntry = {name: inputs.tableName, title: inputs.label, description: "", size: range.totalTiles, minLevel: range.minLevel, maxLevel: range.maxLevel, bounds: range.bounds};
                createTable(newTableEntry).then((realTableName) => {
                    if (realTableName) {
                        let timer = 0

                        tileManager.current?.iterateTilesWithDelay(5, 10, (level: number, x: number, y: number) => {
                            addTileToTable(realTableName, x, y, level);
                            // console.log(`x: ${x} y: ${y} z:${level} `);
                        }, () => {
                            console.info("Download completed");
                        }, (counter, total) => {
                            const ratio = counter / total * 100;
                            const flag = Math.floor(total / 10);
                            if (counter % flag === 0) {
                                console.info("Percentage:" + ratio.toFixed(2) + "%")
                            }
                        });
                    }
                });
            }
        }
    }

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }

    const calculate = () => {
        tileManager.current = new TileManager({
            p1: {lon: Number(inputs.x1), lat: Number(inputs.y1)},
            p2: {lon: Number(inputs.x2), lat: Number(inputs.y2)}
        }, Number(inputs.availableLevels));
        const range = tileManager.current?.getTileRange(Number(inputs.levels));
        if (range) {
            setInputs({...inputs, zoomRange: [range.minLevel, range.maxLevel]})
            setTotalTiles("" + range.totalTiles + ` (Aprox: ${range.totalTiles * .2} MBytes)`)
        }
        return range;
    }

    const createTable = (tableEntry: RaterTableEntry) => {
        return new Promise<string | null>(resolve => {
            const table = camelize(tableEntry.name);
            const tileSetsTableName = "rasters"
            const db = SqLiteDatabase.getDB();
            if (db) {
                const sqlDropIndexTable = `DROP TABLE IF EXISTS ${tileSetsTableName}`;
                const sqlCreateIndexTable = `CREATE TABLE IF NOT EXISTS ${tileSetsTableName}
                                             (
                                                 name TEXT PRIMARY KEY NOT NULL,
                                                 title TEXT,
                                                 description TEXT,
                                                 size INTEGER,
                                                 minLevel INTEGER,
                                                 maxLevel INTEGER,
                                                 boundsX1 REAL,
                                                 boundsY1 REAL,
                                                 boundsX2 REAL,
                                                 boundsY2 REAL
                                             )
                `;
                const sqlDropTable = `DROP TABLE IF EXISTS ${table};`;
                const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${table}
                (
                    x INTEGER NOT NULL,
                    y INTEGER NOT NULL,
                    z INTEGER NOT NULL,
                    img blob,
                    PRIMARY KEY ( x, y, z )
                );`;
                db.executeSet([
                    {statement: sqlCreateIndexTable, values: []},
                    {statement: sqlDropTable, values: []},
                    {statement: sqlCreateTable, values: []}
                ]).then((result => {
                    console.log(result);
                    console.info("Table " + tableEntry.name + " was created");
                    const sqlAddEntry = "INSERT OR REPLACE INTO " + tileSetsTableName +
                        " (name, title, description, size, minLevel, maxLevel, boundsX1, boundsY1, boundsX2, boundsY2) VALUES( ?,?,?,?,?,?, ?,?,?,? )";
                    const sqlValues = [tableEntry.name, tableEntry.title, tableEntry.description, tableEntry.size, tableEntry.minLevel, tableEntry.maxLevel, ...tableEntry.bounds];
                    db.query(sqlAddEntry, sqlValues).then(() => {
                        resolve(table);
                    }).catch((err) => {
                        console.log(err)
                        console.error("Failed to append table " + tableEntry.name + " to available Raster sets.");
                        resolve(null);
                    })
                })).catch((err) => {
                    console.log(err)
                    console.error("Failed to create table " + tableEntry.name + ".");
                    resolve(null);
                })
            }
        })
    }

    const addTileToTable = (table: string, x: number, y: number, z: number) => {
        // @ts-ignore
        const buf2hex = (buffer: ArrayBuffer) =>  [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');

        if (subdomains.length>0) {
            domainIndex.current = (domainIndex.current + 1) % subdomains.length;
        }
        const format = "image/png";
        const layerID = "4ceea49c-3e7c-4e2d-973d-c608fb2fb07e";
        let urlRequest = url +`?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${layerID}&STYLE=default&FORMAT=${format}&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={-y}&TILECOL={x}`;
        ;
        urlRequest = urlRequest.replace("{x}", x.toString());
        urlRequest = urlRequest.replace("{-y}", y.toString());
        urlRequest = urlRequest.replace("{y}", y.toString());
        urlRequest = urlRequest.replace("{z}", z.toString());
        urlRequest = urlRequest.replace("{s}", subdomains[domainIndex.current]);
        requestTile(urlRequest).then((data)=>{
            if (SqLiteDatabase.getDB()) {
                const db = SqLiteDatabase.getDB();
                if (db ) {
                    console.log(urlRequest);
                    const sql = "INSERT OR REPLACE INTO " + table + " (x, y, z, img) VALUES( ?,?,?, X'"+ buf2hex(data) +"')" ;
                    db.query(sql, [x,y,z]).then((result: DBSQLiteValues)=>{
                        console.log(result);
                    }).catch(()=>{
                        // resolve(null);
                    });
                }
            }
        }).catch(()=>{
        })
    }

    const requestTile = (url: string) => {
        return new Promise<ArrayBuffer>((resolve, reject)=>{
            fetch(url)
                .then(function(response) {
                    if (response.status === 200) {
                        response.arrayBuffer().then((data: ArrayBuffer) => {
                            resolve(data);
                        })
                    } else {
                        reject();
                    }
                }).catch((err=>{
                reject();
            }))
        })
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageName}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{pageName}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <form className="ion-padding" onSubmit={onSubmit}>
                    <IonItem>
                        <IonLabel position="floating">Database name</IonLabel>
                        <IonInput value={SqLiteDatabase.getDatabaseName()} placeholder="Database name" readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">x1</IonLabel>
                        <IonInput value={inputs.x1} placeholder="Database name" name="x1" onIonChange={editInput}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">y1</IonLabel>
                        <IonInput value={inputs.y1} placeholder="Database name" name="y1" onIonChange={editInput}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">x2</IonLabel>
                        <IonInput value={inputs.x2} placeholder="Database name" name="x2" onIonChange={editInput}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">y2</IonLabel>
                        <IonInput value={inputs.y2} placeholder="Database name" name="y2" onIonChange={editInput}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Levels available</IonLabel>
                        <IonInput value={inputs.availableLevels} placeholder="Max Levels" name="availableLevels"
                                  onIonChange={editInput}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Levels to capture</IonLabel>
                        <IonInput value={inputs.levels} placeholder="Levels" name="levels" onIonChange={editInput}/>
                    </IonItem>
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButton type="button" size="small" fill="solid" color="primary" expand="block"
                                           onClick={calculate}>
                                    Calculate
                                </IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonItem>
                        <IonLabel position="floating">Tile range:</IonLabel>
                        <IonInput value={inputs.zoomRange.join(",")} placeholder="tiles" readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Total Tiles:</IonLabel>
                        <IonInput value={totalTiles} placeholder="tiles" readonly/>
                    </IonItem>
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButton type="submit" size="small" fill="solid" color="primary" expand="block">
                                    Capture
                                </IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                </form>
            </IonContent>
        </IonPage>
    );
};

function camelize(input: string) {
    const str = input.replace(/[^a-zA-Z ]/g, "");
    return str.replace(/(\w)(\w*)/g,
        function (g0, g1, g2) {
            return g1.toUpperCase() + g2.toLowerCase();
        }).replace(/\s/g, '');
}


export default SavePage;
