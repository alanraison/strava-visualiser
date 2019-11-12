import React, { useEffect, useState } from 'react';
import moment from 'moment';

const ATHLETE_ACTIVITIES = 'https://www.strava.com/api/v3/athlete/activities?';

async function getActivities(accessToken: string, year: number) {
  const start = moment().year(year).startOf('year').unix();
  const end = moment().year(year + 1).startOf('year').unix();
  let page = 0;
  let activityPage;
  let activities: any[] = [] as any[];
  do {
    activityPage = await fetch(`${ATHLETE_ACTIVITIES}${
      [
        `before=${end}`,
        `after=${start}`,
        'per_page=200',
        `page=${++page}`,
      ].join('&')
    }`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    activities.push(...activityPage);
  } while (activityPage.length > 0)
  return activities;
}

const DataVisual: React.FC<{
  accessToken: string
  year: number,
}> = ({
  accessToken,
  year,
}) => {
  const [ activities, setActivities ] = useState();
  useEffect(() => {
    if (year) {
      getActivities(accessToken, year)
      .then(json => {
        setActivities(json);
      })
      .catch(e => console.error(e));
    }
  }, [accessToken, year]);
  return <div>Activities: {activities ? activities.length : 0}</div>
}

export default DataVisual;