import {Map, TileLayer, Util} from "leaflet";
import SqLiteDatabase from "../../database/SqLiteDatabase";

interface LocalPaintConstructorOptions {
    tableName: string;
    maxZoom: number;
}

const LocalPaint = TileLayer.extend({
    initialize: function (options: LocalPaintConstructorOptions) {
        this.tableName = options.tableName;
        Util.setOptions(this, {		maxZoom: options.maxZoom});
    },

    createTile: function (coords: {x:number;y:number;z:number}, done: (v: any, tile: any)=>void) {
        const newImg = document.createElement('img');
        drawCanvasToImg(newImg, this.tableName, coords, done);
        return newImg;
    },

    getAttribution: function() {
        return "<a href='https://placekitten.com/attribution.html'>Local Render</a>"
    }
}) as typeof LocalPaintType;

function drawCanvasToImg(newImg: HTMLImageElement, tableName: string, coords: {x:number;y:number;z:number}, done: (v: any, tile: any)=>void) {
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
        ctx.fillText(tableName,128, 96);
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

export default LocalPaint;