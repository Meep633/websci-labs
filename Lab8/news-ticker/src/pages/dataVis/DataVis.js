import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

import { ScatterPlot } from '../../components/scatterplot/ScatterPlot';
import NBAForm from '../../components/form/NBAForm';
import Notification from '../../components/notification/Notification';
import NBAStatsNavbar from '../../components/navbar/NBAStatsNavbar';
import DataVisForm from '../../components/form/DataVisForm';

export default function DataVis() {
  const [notification, updateNotification] = useState(<></>);
  const openNotification = ({heading, body, show, success}) => {
    if (document.getElementById("noti")) updateNotification(<></>);
    let noti = (
      <Notification 
        heading={heading} 
        body={body} 
        show={show} 
        success={success}
        updateNotification={updateNotification}
      />
    );
    updateNotification(noti);
  };

  const [nbaForm, updateNBAForm] = useState(<></>);
  const openNBAForm = () => {
    if (document.getElementById("nba-form")) updateNBAForm(<></>);
    let form = <NBAForm
                updateForm={updateNBAForm}
                openNotification={openNotification}
               />;
    updateNBAForm(form);
  };
  
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      let response = await axios.get("/nba");
      let newData = [];
      for (let i = 0; i < 50; i++) {
        let stats = await axios.get(response.data[i]);
        newData.push(stats.data);
      }
      setData(newData);
    }
    fetchData();
  }, []);

  const [x, setX] = useState("ppg");
  const [xAxisName, setXAxisName] = useState("Points per game");
  const [y, setY] = useState("fg_pct");
  const [yAxisName, setYAxisName] = useState("Field goal percentage");

  return ( 
    <>
      <NBAStatsNavbar openNBAForm={openNBAForm} openNotification={openNotification} dataLoaded={data.length > 0} />
      {
        data.length > 0
        ? 
        <div className="container-fluid mt-2">
          <DataVisForm setX={setX} setXAxisName={setXAxisName} setY={setY} setYAxisName={setYAxisName} />
          <ScatterPlot data={data.map(val => {
            return {
              x: val[x],
              y: val[y],
              name: val.name
            };
          })} width={700} height={400} fillColor="red" strokeColor="black" xAxisName={xAxisName} yAxisName={yAxisName} />
        </div>
        :
        <div className="container-fluid mt-2">
          Loading data visualizations <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
        </div>
      }

      {nbaForm}
      {notification}
    </> 
  );
}

// after all of that is done, add a link to api documentation on github in the main navbar on the far right
// update readme with anything extra you add