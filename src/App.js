import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';


const DAY = 1000 * 60 * 60 * 24;

function queryParams(params) {
  return Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
}

function getTempData(params) {
  const query = queryParams(params);
  return fetch('http://leanderdev.ddns.net:3000/tempdata?'+query)
  .then((response) => {
    return response.json();
  })
}

function getColor(v){
  const value= v/40;
  var hue=((1-value)*120).toString(10);
  return `hsl(${hue},100%,50%)`;
}

function App() {
  const [order, setOrder] = useState('desc');
  const [range, setRange] = useState({
    createdAt_gte: (new Date(moment().startOf('day'))).getTime(),
    createdAt_lte: (new Date(moment().endOf('day'))).getTime()
  });
  const [tempData, setTempData] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshTempData = () => {
    setLoading(true);
    getTempData({
      _sort: 'id',
      _order: order,
      ...range
    }).then(data => {
      setLoading(false);
      setTempData(data.reverse().map(({createdAt, value}) => ({
        createdAt: moment(createdAt).format('HH:mm'),
        value
      })));
    })
  }

  useEffect(() => {
    refreshTempData()
  }, []);

  useEffect(() => {
    refreshTempData()
  }, [range]);

  const pagePrev = () => {
    setRange(({createdAt_gte, createdAt_lte}) => ({
      createdAt_gte: createdAt_gte - DAY,
      createdAt_lte: createdAt_lte - DAY
    }))
  };

  const pageNext = () => {
    setRange(({createdAt_gte, createdAt_lte}) => ({
      createdAt_gte: createdAt_gte + DAY,
      createdAt_lte: createdAt_lte + DAY
    }))
  };

  return (
    <div className="App">
    <div className = "datalist">
      <div className = "pager">
        <div onClick={pagePrev}>⮜Prev</div>
        <div onClick={pageNext} >Next⮞</div>
      </div>
      {loading ? <div className="loader-wrapper"><div className="loader"></div></div> :       <div className = "list">
        <div className = "title">
           <div>Measurement time</div>
           <div>Value</div>
         </div>
        {tempData.map(item => 
         <div>
           <div>{item.createdAt}</div>
           <div style={{color: getColor(item.value)}} >{item.value} °C</div>
         </div> 
        )}
      </div>}
      </div>
        <div className="lc">
        <div className="lc-label">{moment(range.createdAt_gte).format('L')}</div>
        <div className="lc-label">
          <span><span>Min:</span> {Math.min(...(tempData.map(i => i.value)))}°C</span>
          <span><span>Max:</span> {Math.max(...(tempData.map(i => i.value)))}°C</span>
          <span><span>Avg:</span> {(tempData.reduce( (a, i) => a + i.value,0)/tempData.length).toFixed(2)}°C</span>
          <span><span>Last:</span> {tempData[tempData.length-1]?.value}°C</span>
        </div>
        <ResponsiveContainer width="80%" height="60%">
          <LineChart  data={tempData}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="createdAt" />
            <YAxis domain={[-20, 40]} />
            <Tooltip />
          </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
