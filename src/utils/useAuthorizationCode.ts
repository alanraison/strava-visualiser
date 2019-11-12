import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import useQuery from './useQuery';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const APP_CLIENT_ID = '40059';

const useAuthorizationCode = (scope: string, setState: React.Dispatch<string | Error>) => {
  const [ authToken, setAuthToken ] = useLocalStorage('authorization_code');
  const match = useRouteMatch('/authorization');
  const query = useQuery();
  const history = useHistory();

  const authUrl = [
    `${STRAVA_AUTH_URL}?client_id=${APP_CLIENT_ID}`,
    `redirect_uri=${(window['PUBLIC_URL' as any])}/authorization`,
    'response_type=code',
    `scope=${scope}`,
  ].join('&');

  useEffect(() => {
    if (match && match.url === '/authorization') {
      if (query.get('error')) {
        setState(new Error(query.get('error') || 'unknown'));
        return;
      }
      if (!new RegExp(scope).test(query.get('scope') || '')) {
        setState(new Error(`incorrect scope/insufficent permissions: ${query.get('scope')}`))
        return;
      }
      const code = query.get('code') || '';
      setAuthToken(code);
      history.replace('/')
    }
    if (!authToken) {
      window.location.replace(authUrl);
    }
    setState(authToken);
  });
}

export default useAuthorizationCode;