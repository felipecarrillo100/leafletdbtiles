import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import MainPage from "./pages/MainPage";
import SavePage from "./pages/SavePage";
import RestorePage from "./pages/RestorePage";
import SqLiteDatabase from "./database/SqLiteDatabase";
import {ApplicationCommands} from "./commands/ApplicationCommands";
import {ApplicationCommandsTypes} from "./commands/ApplicationCommandsTypes";
import {useState} from "react";

setupIonicReact();

SqLiteDatabase.connect();

const App: React.FC = () => {
  const [command, setCommand] = useState(null as ApplicationCommandsTypes | null);

  const submitCommand = (command: ApplicationCommandsTypes) => {
    setCommand(command);
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Redirect to="/page/Main" />
            </Route>
            <Route path="/page/Main" exact={true}>
              <MainPage command={command}/>
            </Route>
            <Route path="/page/Save" exact={true}>
              <SavePage />
            </Route>
            <Route path="/page/Restore" exact={true}>
              <RestorePage submitCommand={submitCommand} />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
