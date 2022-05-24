import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import './Page.css';
import SqLiteDatabase from "../database/SqLiteDatabase";
import {useState} from "react";
import {CreateCommand} from "../commands/CreateCommand";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {LayerTypes} from "../layertypes/LayerTypes";
import {ApplicationCommandsTypes} from "../commands/ApplicationCommandsTypes";
import {useHistory} from "react-router";

interface DatabaseRasterTableStructure {
    name: string;
    title: string;
    description: string;
    size: number
    maxLevel: number
    minLevel: number;
    boundsX1: number;
    boundsX2: number;
    boundsY1: number;
    boundsY2: number;
}

interface Props {
    submitCommand: (command: ApplicationCommandsTypes) => void;
}

const RestorePage: React.FC<Props> = (props: Props) => {
    const history = useHistory();

  const  pageName  = "Restore";

    const [layers, setLayers] = useState([] as DatabaseRasterTableStructure[]);
    const [inputs, setInputs] = useState({
        layer: "",
        bounds: [] as number[],
        minLevel: 0,
        maxLevel: 0,
    });

    const onSubmit = (event:any) => {
        event.preventDefault();
        event.stopPropagation();
        const fLayer = layers.find(l=>l.name === inputs.layer);
        if (fLayer) {
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.DatabaseRasterTileset,
                    model: {
                        tableName: fLayer.name,
                        levelCount: fLayer.maxLevel,
                        dataBounds: {
                            reference: "CRS:84",
                            coordinates: [inputs.bounds[0], inputs.bounds[2]-inputs.bounds[0], inputs.bounds[1], inputs.bounds[3]-inputs.bounds[1] ],
                        }
                    },
                    layer: {
                        label: fLayer.name,
                        visible: true
                    }
                }
            });
            props.submitCommand(command);
            history.push('/page/Main');
        } else {
            console.error("No layer selected");
        }
    }

  const getTables = () => {
      if (SqLiteDatabase.getDB()) {
          const db = SqLiteDatabase.getDB();
          if (db) {
              const tileSetsTableName = "rasters"
              const sql = `SELECT * FROM ${tileSetsTableName}`;
              db.query(sql, []).then(result=>{
                  if (result && result.values && result.values.length>0) {
                      setLayers(result.values);
                      const fLayer: DatabaseRasterTableStructure = result.values[0];
                      setInputs({
                          ...inputs,
                          layer: fLayer.name,
                          minLevel: fLayer.minLevel,
                          maxLevel: fLayer.maxLevel,
                          bounds:  [fLayer.boundsX1, fLayer.boundsY1, fLayer.boundsX2, fLayer.boundsY2]
                      });
                  }
              })
          }
      } else {
          console.error("Database not connected");
      }
  }

    const renderLayers = layers.map((l)=>(
        <IonSelectOption value={l.name} key={l.name}>{l.name}</IonSelectOption>
    ));

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="layer") {
            newInputs.layer = value;
            const fLayer= layers.find(l=>l.name === newInputs.layer);
            if (fLayer) {
                newInputs.minLevel = fLayer.minLevel;
                newInputs.maxLevel = fLayer.maxLevel;
                newInputs.bounds = [fLayer.boundsX1, fLayer.boundsY1, fLayer.boundsX2, fLayer.boundsY2]
            }
            setInputs(newInputs);
        } else {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        }
    }

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
          <form className="ion-padding" onSubmit={onSubmit}>
              <IonItem>
                  <IonLabel position="floating">Database name</IonLabel>
                  <IonInput value={SqLiteDatabase.getDatabaseName()} placeholder="Database name" readonly/>
              </IonItem>
              <IonRow>
                  <IonCol>
                      <div className="ion-float-end">
                          <IonButton type="button" size="small" fill="solid" color="primary" expand="block"
                                     onClick={getTables}>
                              Get tables
                          </IonButton>
                      </div>
                  </IonCol>
              </IonRow>
              <IonItem>
                  <IonSelect value={inputs.layer} okText="OK" cancelText="Cancel" onIonChange={editInput} name="layer">
                      {renderLayers}
                  </IonSelect>
              </IonItem>
              <IonItem>
                  <IonLabel position="floating">Bounds</IonLabel>
                  <IonInput value={`[${inputs.bounds.join(", ")}]` } placeholder="Bounding box" readonly/>
              </IonItem>
              <IonItem>
                  <IonLabel position="floating">Levels</IonLabel>
                  <IonInput value={"[" + inputs.minLevel + ", " + inputs.maxLevel+ "]" } placeholder="Levels range" readonly/>
              </IonItem>
              <IonRow>
                  <IonCol>
                      <div className="ion-float-end">
                          <IonButton type="submit" size="small" fill="solid" color="primary" expand="block">
                              Restore
                          </IonButton>
                      </div>
                  </IonCol>
              </IonRow>
          </form>
      </IonContent>
    </IonPage>
  );
};

export default RestorePage;
