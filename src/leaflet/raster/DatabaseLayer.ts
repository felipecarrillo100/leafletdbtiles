import {Map, TileLayer, Util} from "leaflet";
import SqLiteDatabase from "../../database/SqLiteDatabase";
import {DBSQLiteValues, SQLiteDBConnection} from "@capacitor-community/sqlite";

interface LocalPaintConstructorOptions {
    tableName: string;
    maxZoom: number;
}

const DatabaseLayer = TileLayer.extend({
    initialize: function (options: LocalPaintConstructorOptions) {
        this.tableName = options.tableName;
        Util.setOptions(this, {		maxZoom: options.maxZoom});
    },
    createTile: function (coords: {x:number;y:number;z:number}, done: (v: any, tile: any)=>void) {
        const newImg = document.createElement('img');
        const db = SqLiteDatabase.getDB();
        if (db) {
            drawDBToImg(newImg, db, this.tableName, coords, done);
        } else {
            drawCanvasToImg(newImg, "No database", coords, done);
        }
        return newImg;
    },

    getAttribution: function() {
        return "<a href='https://www.hexagongeospatial.com/products/luciad-portfolio'>Luciad</a>"
    }
}) as typeof LocalPaintType;

function drawDBToImg(newImg: HTMLImageElement, db: SQLiteDBConnection, tableName: string, coords: {x:number;y:number;z:number}, done: (v: any, tile: any)=>void) {
    const sql = `SELECT hex(img) from ${tableName} WHERE x=? AND y=? AND z=?`;

    db.query(sql, [coords.x, coords.y, coords.z]).then((result:DBSQLiteValues)=>{
        // @ts-ignore
        const fromHexString = (hexString:string) => new Uint8Array(hexString.match(/(..?)/g).map(byte => parseInt(byte, 16)));
        if (result && result.values && result.values.length>0) {
            const uint8 = fromHexString(result.values[0]["hex(img)"]);
            const imgBlob = new Blob([uint8], {type: "octet/stream"})
            const url = URL.createObjectURL(imgBlob);

            newImg.onload = function() {
                // no longer need to read the blob so it's revoked
                done(null, newImg);	// Syntax is 'done(error, tile)'
                URL.revokeObjectURL(url);
            };
            newImg.onerror = function () {
                drawCanvasToImg(newImg, "Load Error", coords, done);
            }
            newImg.src = url;
        } else {
            drawCanvasToImg(newImg, "Not found", coords, done)
        }
    }).catch(()=>{
        drawCanvasToImg(newImg, "DB Error", coords, done);
    })
}

function drawCanvasToImg(newImg: HTMLImageElement, textBanner: string, coords: {x:number;y:number;z:number}, done: (v: any, tile: any)=>void) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "red";
        ctx.rect(10, 10, 256-20, 256-20);
        ctx.stroke();
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        const text = `x=${coords.x} y=${coords.y} level=${coords.z}`;
        ctx.fillStyle = "#00ff00";
        ctx.fillText(text,128, 64);
        ctx.fillText(textBanner,128, 96);
    }

    canvas.toBlob(function(blob) {
        if (blob) {
            const url = URL.createObjectURL(blob);
            newImg.onload = function() {
                // no longer need to read the blob so it's revoked
                done(null, newImg);	// Syntax is 'done(error, tile)'
                URL.revokeObjectURL(url);
            };
            newImg.src = url;
        }
    });
}

declare class LocalPaintType{
    constructor(options: LocalPaintConstructorOptions);
    addTo(map: Map): void ;
}

export default DatabaseLayer;