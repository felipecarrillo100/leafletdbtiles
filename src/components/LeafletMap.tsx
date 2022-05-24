import {useEffect, useRef} from "react";

import "./LeafletMap.css";
import * as L from 'leaflet';

import MyIcon from "leaflet/dist/images/marker-icon.png";
import LocalPaint from "../leaflet/raster/LocalPaint";
import {ApplicationCommandsTypes} from "../commands/ApplicationCommandsTypes";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {CreatDatabaseRasterTilesetCommand} from "../commands/ConnectCommands";
import DatabaseLayer from "../leaflet/raster/DatabaseLayer";

const myIcon = L.icon({
    iconUrl: MyIcon,
    iconAnchor:[25/2,41]
});

interface Props {
    id: string;
    className?: string;
    command?: ApplicationCommandsTypes | null;
}

const LeafletMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {

    const layerControl = useRef(null as L.Control.Layers | null);
    const leafletMap = useRef(null as L.Map | null);

    const divEl = useRef(null);
    const className = "LeafletMap"+ (typeof props.className !=="undefined" ? " " + props.className : "");

    const addLayers = (map: L.Map) => {
        const layer1 = addWMTS(map);
        const layer2 = addCustomTiles(map);
        return [layer1, layer2];
    }

    const addWMTS = (map: L.Map) => {
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
        }).addTo(map);
        return layer;
    }

    const addCustomTiles = (map: L.Map) => {
        const tileLayer = new LocalPaint({tableName: "sometable", maxZoom: 20});
        tileLayer.addTo(map);
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

    const addLayerControl = (map: L.Map, layers: any[]) => {
        const baseMaps = {
        };

        const overlayMaps = {
            "A": layers[0],
            "B": layers[1]
        };
        const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
        return layerControl;
    }

    useEffect(()=>{
        // On create
        if (leafletMap.current===null) {
            const map = L.map(props.id).setView([34.10164883043099, -118.32670428784138], 18);
            leafletMap.current = map;
            setTimeout(()=>{
                map.invalidateSize();
            },1)

            const layers = addLayers(leafletMap.current);
            addMarker(leafletMap.current);
            const lc = addLayerControl(leafletMap.current, layers);
            layerControl.current = lc;
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

    const createLayerOnDemand = (command: CreatDatabaseRasterTilesetCommand) => {
        if (leafletMap.current && layerControl.current) {
            const layer = new DatabaseLayer({tableName: command.parameters.model.tableName, maxZoom: command.parameters.model.levelCount});
            layer.addTo(leafletMap.current)
            layerControl.current.addOverlay(layer as L.Layer, command.parameters.layer.label);
        }
    }

    return (
        <div id={props.id} className={className} ref={divEl}>
            {props.children}
        </div>
    );
};

export default LeafletMap;
