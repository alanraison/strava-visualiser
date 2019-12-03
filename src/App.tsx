import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import AuthorizationRoute from './AuthorizationRoute';
import './App.css';
import { LoginData } from './model';
import DataVisual from './DataVisual';
import ErrorHandler from './ErrorHandler';

const SCOPE = 'activity:read_all';

const App: React.FC = () => {
  const [ loginData, setLoginData ] = useState<LoginData | Error>();
  const athlete = loginData instanceof LoginData ? loginData.athlete : null;
  
  return (
    <div className="content">
      <header>
        <h1>Annual Stats</h1>
        <div className="profile_photo">
          {
            athlete
            ? <img
                src={athlete.profileMedium} 
                alt={athlete.username}
              />
            : <i className="material-icons">person</i>
          }
        </div>
      </header>
      <main>
        <Router>
          {
            loginData instanceof Error 
            ? <div>Error: {loginData.toString()}</div>
            : <AuthorizationRoute scope={SCOPE} loginData={loginData} setLoginData={setLoginData}/>
          }
          <Switch>
            <Route path="/data">
              {
                loginData && loginData instanceof LoginData
                ? <ErrorHandler>
                    <DataVisual accessToken={loginData.accessToken} year={2019}/>
                  </ErrorHandler>
                : null
              }
            </Route>
          </Switch>
        </Router>
      </main>
    </div>
  );
}

export default App;
