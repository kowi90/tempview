import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { ComposedChart , Area, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [visible, setVisible] = useState({
    min: true,
    max: true,
    avg: true,
    diff: true
  });

  useEffect(() => {
    getReports().then(res => {
      setReports(Object.keys(res).map(v => ({ ...res[v], date: v, diff: (res[v].max-res[v].min).toFixed(2)})));
  });
  }, []);

  const refreshTempData = () => {
    generateReports().then(() => {
        getReports().then(res => {
            setReports(Object.keys(res).map(v => ({ ...res[v], date: v, diff: (res[v].max-res[v].min).toFixed(2)})));
        });
    });
  }
  const formatXAxis = (tickItem) =>{
    return moment(tickItem).format('YYYY.MM.DD.')
    }

    const toggleVisible = (item) => {
      setVisible(({[item]: current, ...rest}) => ({...rest, [item]: !current}));
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
       <div className="lc-label">
          <button onClick={() => toggleVisible('max')} >Toggle max</button>
          <button onClick={() => toggleVisible('avg')} >Toggle avg</button>
          <button onClick={() => toggleVisible('min')} >Toggle min</button>
          <button onClick={() => toggleVisible('diff')} >Toggle diff</button>
        </div>
        <ResponsiveContainer width="80%" height="60%" className="chartstyle">
          <ComposedChart  setRange data={reports.map(({date, ...r}) => ({...r, date: new Date(date).getTime()}))}>
            { visible.max && <Area isAnimationActive={false} connectNulls={true} dataKey="max" stroke="#ffc629" fill="#ffc629" type="monotone" fillOpacity={0.5}/>}
            { visible.avg && <Area isAnimationActive={false} connectNulls={true} dataKey="avg" stroke="#3ce339" fill="#3ce339" type="monotone" fillOpacity={0.6}/>}
            { visible.min && <Area isAnimationActive={false} connectNulls={true} dataKey="min" stroke="#2436bd" fill="#2436bd" type="monotone" fillOpacity={0.9}/>}
            { visible.diff && <Bar isAnimationActive={false} dataKey="diff" fill="#000000" fillOpacity={0.5}/>}
            <CartesianGrid stroke="#ccc" />
            <XAxis
              scale="linear"
              tickFormatter={formatXAxis}
              dataKey="date"/>
            <YAxis domain={[-20, 40]} />
            <Tooltip 
            labelFormatter={formatXAxis}
            />
          </ComposedChart>
          </ResponsiveContainer>
      </div>}
    </div>
  );
}

export default Reports;
