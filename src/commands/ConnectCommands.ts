import {ApplicationCommands} from "./ApplicationCommands";
import {LayerTypes} from "../layertypes/LayerTypes";

export interface BoundsObject {
    reference: string;
    coordinates: number[]
}

export  interface CreateLayerBaseCommand {
    action: ApplicationCommands;
    parameters: {
        layerType: LayerTypes;
        model?: {
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export interface CreatDatabaseRasterTilesetCommand  extends CreateLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.DatabaseRasterTileset;
        model: {
            tableName: string;
            levelCount: number;
            dataBounds: BoundsObject;
        };
        layer: {
            visible: boolean;
            label: string;
        };
    }
}


export type LayerConnectCommandsTypes =  CreatDatabaseRasterTilesetCommand;