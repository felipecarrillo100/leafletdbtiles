import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonHeader, IonIcon,
    IonInput,
    IonItem, IonItemOption, IonItemOptions, IonItemSliding,
    IonLabel, IonList,
    IonMenuButton,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import './Page.css';
import {useEffect, useState} from "react";
import {ApplicationCommandsTypes} from "../commands/ApplicationCommandsTypes";
import {useHistory} from "react-router";
import * as L from "leaflet";
import LayerManager, {LayerItem} from "../leaflet/control/LayerManager";
import {documentOutline, documentSharp, trashOutline, trashSharp} from "ionicons/icons";


interface Props {
    submitCommand: (command: ApplicationCommandsTypes) => void;
    layerManager: LayerManager | null;
}

const LayerControlPage: React.FC<Props> = (props: Props) => {
   const history = useHistory();

  const  pageName  = "Layers";

  const [layers, setLayers] = useState([] as LayerItem[]);


    const onNewLayer = () => {
        if (props.layerManager) {
            const newLayers = [...props.layerManager.getLayers()];
            setLayers(newLayers);
        }
    }

    const onRemoveLayer = () => {
        if (props.layerManager) {
            const newLayers = [...props.layerManager.getLayers()];
            setLayers(newLayers);
        }
    }

    useEffect(()=>{
       if (props.layerManager) {
          const newLayers = [...props.layerManager.getLayers()];
          setLayers(newLayers);
          props.layerManager.on("addLayer", onNewLayer);
          props.layerManager.on("removeLayer", onRemoveLayer);
       }
   }, [props.layerManager])

    const deleteLayer = (l:LayerItem) => (e: any) => {
       if (props.layerManager) {
           props.layerManager.removeLayer(l.layer);
       }
    }

    const renderLayers = layers.map((layer, index)=>
        (
            <IonItemSliding key={index}>
                <IonItem>
                    <IonIcon slot="start" ios={documentOutline} md={documentSharp} />
                    <IonLabel>{layer.label}</IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                    <IonItemOption onClick={deleteLayer(layer)}>
                        <IonIcon slot="start" ios={trashOutline} md={trashSharp} />
                    </IonItemOption>
                </IonItemOptions>
            </IonItemSliding>
        )
    );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
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
          <IonList>
              {renderLayers}
          </IonList>
      </IonContent>
    </IonPage>
  );
};

export default LayerControlPage;
