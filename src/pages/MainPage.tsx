import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import LeafletMap from "../components/LeafletMap";
import {ApplicationCommandsTypes} from "../commands/ApplicationCommandsTypes";
import * as L from "leaflet";
import LayerManager from "../leaflet/control/LayerManager";


interface Props {
    command: ApplicationCommandsTypes | null;
    onLayerChange?: (map: LayerManager)=> void;
}

const MainPage: React.FC<Props> = (props: Props) => {

  const  pageName  = "Main";

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
         <LeafletMap id="leaflet-map-id" command={props.command} onLayerChange={props.onLayerChange}/>
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
