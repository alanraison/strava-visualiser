import { useEffect, useState } from 'react';
import useAuthorizationCode from './useAuthorizationCode';
import { LoginData, Athlete } from '../model';

// const TOKEN_EXCHANGE_URL = 'https://5d459vr4qi.execute-api.eu-west-1.amazonaws.com/v1/token';
const TOKEN_EXCHANGE_URL = 'http://localhost:3000/v1/token';

const useAuthentication = (scope: string, setLoginData: React.Dispatch<LoginData | Error>) => {
  const [ authToken, setTokenState ] = useState();
  useAuthorizationCode(scope, setTokenState);

  useEffect(() => {
    if (authToken) {
      fetch(TOKEN_EXCHANGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          grantType: 'authorization_code',
          code: authToken,
        }),
        mode: 'cors',
      })
      .then(res => {
        return (res.ok) ? res.json() : Promise.reject(res.json())
      })
      .then(body => {
        setLoginData(new LoginData(
          body.access_token,
          body.refresh_token,
          new Date(body.expires_at),
          new Athlete(
            body.athlete.id,
            body.athlete.username,
            body.athlete.firstname,
            body.athlete.lastname,
            body.athlete.city,
            body.athlete.state,
            body.athlete.country,
            body.athlete.sex,
            body.athlete.profile_medium,
            body.athlete.profile,
          ),
        ))
      })
      .catch(e => {
        console.error(e);
        setLoginData(e);
      })
    }
  }, [authToken, setLoginData]);
}

export default useAuthentication;