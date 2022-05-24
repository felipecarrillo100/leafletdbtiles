import * as L from "leaflet";

export interface LayerItem {
    layer: L.Layer;
    label: string;
}

type LayermanagerEvents = "addLayer"| "removeLayer";
interface LayermanagerEventType {
    id: number;
    event: LayermanagerEvents;
    callback: (layerItem: LayerItem) => void;
}

class LayerManager {
    private map: L.Map;
    private layerControl: L.Control.Layers;
    private layers: LayerItem[] = [];
    private clients: LayermanagerEventType[] = [];
    private clientCounter = 0;

    constructor(map: L.Map, layerControl: L.Control.Layers) {
        this.map = map;
        this.layerControl = layerControl;
    }

    public addLayer(layer: L.Layer, layerName: string) {
        layer.addTo(this.map);
        this.layerControl.addOverlay(layer, layerName);
        const layerItem = {layer: layer, label: layerName};
        this.layers.push(layerItem);
        this.notify("addLayer", layerItem);
    };

    public removeLayer(layer: L.Layer) {
        const index = this.layers.findIndex( (l) => l.layer === layer);
        if (index>-1) {
            const layerItem = this.layers[index];
            this.layers.splice(index, 1);

            this.map.removeLayer(layer);
            this.layerControl.removeLayer(layer);
            this.notify("removeLayer", layerItem);
        }
    }

    private notify(event: LayermanagerEvents, layerItem: LayerItem) {
        const clients = this.clients.filter(c=>c.event===event);
        for (const client of clients) {
            if (typeof client.callback === "function"){
                client.callback(layerItem);
            }
        }
    }

    public on(event: LayermanagerEvents, callback: (layerItem: LayerItem) => void): LayermanagerEventType {
        const e = {id: this.clientCounter++, event, callback};
        this.clients.push(e);
        return e;
    }

    public off(client: LayermanagerEventType) {
        const index = this.clients.findIndex(c=>c.id === client.id );
        if (index > -1) {
           this.clients.splice(index, 1);
        }
    }

    public getLayers() {
        return this.layers;
    }

}

export default LayerManager