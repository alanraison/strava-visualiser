import React, { useCallback, useEffect, useRef } from 'react';
import { select, Selection } from 'd3-selection';
import { nest, Nest } from 'd3-collection';
import { ascending, sum, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import moment from 'moment';
import useActivities from './utils/useActivities';

interface ActivityData {
  type: string;
  start_date_local: string;
  distance: number;
}

interface CumulativeActivityData {
  type: string;
  startDateLocal: string;
  cumulativeDistance: number;
}

class CumulativeDistance {
  constructor(readonly tot: number, readonly acc: CumulativeActivityData[]) {}
}

interface ActivityDataDayRollup {
  total_distance_day: number;
}

interface GraphData extends Array<{
  type: string,
  months: Array<{
    month: string,
    activities: Array<{
      day: string,
      cumulative_distance: number,
    }>
  }>,
}> {}

function prepareData(activities: [ActivityData]): { key: string, values: any, value: CumulativeDistance | undefined }[] {
  return nest<ActivityData, CumulativeDistance>()
    .key(d => d.type)
    .key(d => moment(d.start_date_local).format('YYYY-MM')).sortKeys(ascending)
    .rollup(leaves => leaves.reduce(
      ({tot, acc}: CumulativeDistance, cur: ActivityData) => ({
        tot: tot + cur.distance,
        acc: acc.concat([{
          type: cur.type,
          startDateLocal: cur.start_date_local,
          cumulativeDistance: cur.distance + tot,
        }])
      }), { tot: 0, acc: [] }
    ))
    .entries(activities);
}

const DataVisual: React.FC<{
  accessToken: string,
  year: number,
}> = ({
  accessToken,
  year,
}) => {
  const activities = prepareData(useActivities(accessToken, year) || []);
  console.log(activities);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fullWidth = 800;
    const fullHeight = 600;
    const margin = { top: 40, bottom: 40, right: 40, left: 40 };
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    const drawActivities = (
      area: Selection<SVGGElement, unknown, null, undefined>,
      activities: {
        key: string,
        values: Array<{ key: string, value: CumulativeDistance }>,
        value: CumulativeDistance | undefined,
      },
    ) => {
      const xScale = scaleLinear()
        .domain([0, 1])
        .range([0, width]);

      debugger;
      const yMax = max(activities.values, l => l.value.tot) || 0
      const yScale = scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

      const lineGen = line<CumulativeActivityData>()
        .x(d => {
          const m = moment(d.startDateLocal)
          const end = moment(m).endOf('month');
          return xScale(m.date() / end.date())
        })
        .y(d => yScale(d.cumulativeDistance));
      
      debugger;
      const lines = area
        .selectAll('.lines')
        .data(activities.values)
        .enter()
        .append('path')
        .attr('d', d => lineGen(d.value.acc))
        .style('fill', 'none')
        .style('stroke', 'black')

        const xAxis = axisBottom(xScale)
          .ticks(0);
        const yAxis = axisLeft(yScale);
  
        area.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);
        area.append('g')
          .attr('class', 'y axis')
          .call(yAxis);
    };
    if (activities && activities.length && nodeRef.current) {
      select(nodeRef.current)
        .append('select')
        .attr('id', 'activity-type')
        .selectAll('option')
        .data(activities)
        .enter()
        .append('option')
        .attr('value', d => d.key)
        .text(d => d.key)
        // .on('change', function () { drawActivities(area, select(this).data()[0].values) })

      const svg = select(nodeRef.current)
        .append('svg')
        .attr('width', fullWidth)
        .attr('height', fullHeight)
      const area = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      drawActivities(area, activities[0])
    }
  }, [activities]);

  return <div id="parent" ref={nodeRef}></div>
}

export default DataVisual;