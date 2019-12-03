import React from 'react';
import useAuthentication from './utils/useAuthentication';
import { LoginData } from './model';
import { Redirect } from 'react-router';

const AuthorizationRoute: React.FC<{
  scope: string,
  loginData?: LoginData,
  setLoginData: React.Dispatch<LoginData | Error>,
}> = ({
  scope,
  loginData,
  setLoginData,
}) => {
  useAuthentication(scope, setLoginData);

  if (loginData instanceof Error) {
    return <div>Error: {loginData.toString()}</div>
  } else {
    return <Redirect to="/data"/>;
  }
};

export default AuthorizationRoute;
