import {useEffect, useRef} from "react";

import "./LeafletMap.css";
import * as L from 'leaflet';

import MyIcon from "leaflet/dist/images/marker-icon.png";
import LocalPaint from "../leaflet/raster/LocalPaint";
import {ApplicationCommandsTypes} from "../commands/ApplicationCommandsTypes";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {CreatDatabaseRasterTilesetCommand, LayerConnectCommandsTypes} from "../commands/ConnectCommands";
import DatabaseLayer from "../leaflet/raster/DatabaseLayer";
import {LayerTypes} from "../layertypes/LayerTypes";
import LayerManager from "../leaflet/control/LayerManager";

const myIcon = L.icon({
    iconUrl: MyIcon,
    iconAnchor:[25/2,41]
});

interface Props {
    id: string;
    className?: string;
    command?: ApplicationCommandsTypes | null;
    onLayerChange?: (layerManager: LayerManager)=> void;
}

const LeafletMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {

    const layerManager = useRef(null as LayerManager | null);

    const divEl = useRef(null);
    const className = "LeafletMap"+ (typeof props.className !=="undefined" ? " " + props.className : "");

    const addLayers = (map: L.Map) => {
        const layer1 = createWMTSLayer(map);
        const layer2 = createCustomTilesLayer(map) as L.Layer;

        if (layerManager.current) {
            layerManager.current.addLayer(layer1, "WMTS");
            layerManager.current.addLayer(layer2, "TestGrid");
        }
    }

    const createWMTSLayer = (map: L.Map) => {
        const wmtsEndpoint = "https://sampleservices.luciad.com/wmts";
        const format = "image/png";
        const layerID = "4ceea49c-3e7c-4e2d-973d-c608fb2fb07e";
        const style = "default";
        const tilematrixset = "GoogleMapsCompatible";

        const urlRequest = `${wmtsEndpoint}?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${layerID}&STYLE=${style}&FORMAT=${format}&TILEMATRIXSET=${tilematrixset}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
        const layer = L.tileLayer(urlRequest, {
            minZoom: 0,
            maxZoom: 20,
            attribution: '<a target="_blank" href="https://www.hexagongeospatial.com/products/luciad-portfolio">Hexagon</a>'
        });
        return layer;
    }

    const createCustomTilesLayer = (map: L.Map) => {
        const tileLayer = new LocalPaint({tableName: "sometable", maxZoom: 20});
        return tileLayer;
    }

    const addMarker = (map: L.Map) => {
        const marker = L.marker([34.10164883043099, -118.32670428784138], {icon: myIcon}).addTo(map)
            .bindPopup('Hollywood & Vine.<br>Point of interest.', {closeButton: true});

        marker.getPopup()?.on('add', (e: any) =>{
            //Your code here
            const closeButton = e.sourceTarget._closeButton as HTMLHRElement;
            closeButton.onclick = (e) => {e.preventDefault(); e.stopPropagation();};

        });
        marker.getPopup()?.on('remove', function(e: any) {
            //Your code here
        });
    }

    const createLayerControl = (map: L.Map) => {
        const baseMaps = {};
        const overlayMaps = {};
        const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
        return layerControl;
    }

    useEffect(()=>{
        // On create
        if (layerManager.current===null) {
            const map = L.map(props.id).setView([34.10164883043099, -118.32670428784138], 18);

            setTimeout(()=>{
                map.invalidateSize();
            },1)

            addMarker(map);
            const layerControl = createLayerControl(map);
            const newLayerManager = new LayerManager(map, layerControl);
            layerManager.current = newLayerManager;

            if (typeof props.onLayerChange==="function") {
                props.onLayerChange(layerManager.current);
            }
            setTimeout(()=>{
                if (map) addLayers(map);
            },1)
        }
        return () => {
            // On destroy
        }
    }, []);

    useEffect(()=>{
        // On command
        if (props.command && props.command.action === ApplicationCommands.CREATELAYER) {
            createLayerOnDemand(props.command);
        }
    }, [props.command]);

    const createLayerOnDemand = (command: LayerConnectCommandsTypes) => {
        if (layerManager.current) {
            switch (command.parameters.layerType) {
                case LayerTypes.DatabaseRasterTileset:
                    const layer = new DatabaseLayer({tableName: command.parameters.model.tableName, maxZoom: command.parameters.model.levelCount});
                    layerManager.current?.addLayer(layer as L.Layer, command.parameters.layer.label);
                    break;
            }
        }
    }

    return (
        <div id={props.id} className={className} ref={divEl}>
            {props.children}
        </div>
    );
};

export default LeafletMap;
