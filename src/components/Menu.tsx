import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import {
  cloudDownloadOutline, cloudDownloadSharp, layersOutline, layersSharp,
  mapOutline, mapSharp,
  serverOutline, serverSharp
} from 'ionicons/icons';
import './Menu.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Main',
    url: '/page/Main',
    iosIcon: mapOutline,
    mdIcon: mapSharp
  },
  {
    title: 'Layers',
    url: '/page/Layers',
    iosIcon: layersOutline,
    mdIcon: layersSharp
  },
  {
    title: 'Save',
    url: '/page/Save',
    iosIcon: cloudDownloadOutline,
    mdIcon: cloudDownloadSharp
  },
  {
    title: 'Restore',
    url: '/page/Restore',
    iosIcon: serverOutline,
    mdIcon: serverSharp
  },
];

const labels: string[] = [];

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Inbox</IonListHeader>
          <IonNote>felipecarrillo100@github</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
