import React, { useState } from 'react';
import moment from 'moment';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';
import { ROUTE_APP } from './index';


const DAY = 1000 * 60 * 60 * 24;

function generateReports() {
  return fetch('http://leanderdev.ddns.net:3000/generate-report')
  .then((response) => {
    return response.json();
  })
}

function getReports() {
    return fetch('http://leanderdev.ddns.net:3000/report')
    .then((response) => {
      return response.json();
    })
  }

function getColor(v){
  const value= v/40;
  var hue=((1-value)*120).toString(10);
  return `hsl(${hue},100%,50%)`;
}
function minToH(min) {
  const hval = Math.floor(min/60);
  const mval = min - (hval * 60);

  const lz = v => v > 9 ? v : `0${v}`;

  return `${lz(hval)}:${lz(mval)}`
}

function Reports({setCurrentRoute}) {

  const [reports, setReports] = useState([]);

  const refreshTempData = () => {
    generateReports().then(() => {
        getReports().then(res => {
            setReports(Object.keys(res).map(v => ({ ...res[v], date: v})));
        });
    });
  }
  const formatXAxis = (tickItem) =>{
    return moment(tickItem).format('YYYY.MM.DD.')
    }
   return (
    <div className="App">
    <div className = "datalist">
      <div className = "currentpage">
      <button onClick={() => {
          setCurrentRoute(ROUTE_APP)
      }}>
        Back to temperature
      </button>
      <button onClick={refreshTempData}>
        Generate reports
      </button>
      </div>
      <div className = "list">
        <div className = "title">
           <div>Date</div>
           <div>Values</div>
         </div>
        {reports.map((item, index) => 
         <div>
           <div>{item.date}</div>
           <div>
            <div style={{color: getColor(item.avg)}} >Avg:{item.avg} °C</div>
            <div style={{color: getColor(item.min)}} >Min:{item.min} °C</div>
            <div style={{color: getColor(item.max)}} >Max:{item.max} °C</div>
           </div>
         </div> 
        )}
      </div>
      </div>
       {!!reports.length && <div className="lc">
        <ResponsiveContainer width="80%" height="60%" className="chartstyle">
          <LineChart  setRange data={reports.map(({date, ...r}) => ({...r, date: new Date(date).getTime()}))}>
            <Line isAnimationActive={false} connectNulls={true} dataKey="avg" stroke="#00ff00" />
            <Line isAnimationActive={false} connectNulls={true} dataKey="min" stroke="#0000ff" />
            <Line isAnimationActive={false} connectNulls={true} dataKey="max" stroke="#ff0000" />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              scale="linear"
              tickFormatter={formatXAxis}
              dataKey="date"/>
            <YAxis />
            <Tooltip />
          </LineChart>
          </ResponsiveContainer>
      </div>}
    </div>
  );
}

export default Reports;
