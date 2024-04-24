import { useEffect, useState } from 'react';
import {ScatterPlot} from './components/scatterplot/ScatterPlot';
import axios from "axios";

export default function DataVis() {
  const [data, setData] = useState([]);
    useEffect(() => {
        async function fetchData() {
            let response = await axios.get("/nba");
            let newData = [];
            for (let i = 0; i < 20; i++) {
                let stats = await axios.get(`${response.data[i]}`);
                newData.push(stats.data);
            }
            setData(newData);
        }
        fetchData();
    }, []);

    console.log(data);

    return ( 
      <>
        {data.length > 0
        ? 
        <>
          <ScatterPlot data={data.map(val => {
            return {
              x: val.ppg,
              y: val.fg_pct,
              name: val.name
            };
          })} width={700} height={400} fillColor="red" strokeColor="black" xAxisName="Points per game" yAxisName="Field goal percentage" />
          <ScatterPlot data={data.map(val => {
            return {
              x: val.ppg,
              y: val.fta,
              name: val.name
            };
          })} width={700} height={400} fillColor="blue" strokeColor="blue" xAxisName="Points per game" yAxisName="Free throws attempted per game" />
        </>
        :
        <div>Loading data visualizations</div>
        }
      </> 
    );
}