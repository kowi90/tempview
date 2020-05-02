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
function minToH(min) {
  const hval = Math.floor(min/60);
  const mval = min - (hval * 60);

  const lz = v => v > 9 ? v : `0${v}`;

  return `${lz(hval)}:${lz(mval)}`
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
        createdAt: moment(createdAt).format('HH:mm').split(':').map((value, index) => index === 0 ?  parseInt(value)* 60 : parseInt(value)).reduce((c,p) => p+c ,0),
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
        <div onClick={pagePrev}><i class="fas fa-long-arrow-alt-left"></i></div>
        <div onClick={refreshTempData}><i class="far fa-dot-circle"></i></div>
        <div onClick={pageNext} ><i class="fas fa-long-arrow-alt-right"></i></div>
      </div>
      <div className = "currentpage">
      {moment(range.createdAt_gte).format('L')}
      </div>
      {loading ? <div className="loader-wrapper"><div className="loader"></div></div> :       <div className = "list">
        <div className = "title">
           <div>Measurement time</div>
           <div>Value</div>
         </div>
        {tempData.map(item => 
         <div>
           <div>{minToH(item.createdAt)}</div>
           <div style={{color: getColor(item.value)}} >{item.value} °C</div>
         </div> 
        )}
      </div>}
      </div>
        <div className="lc">
        <div className="lc-label">
          <span><span>Min:</span> {Math.min(...(tempData.map(i => i.value)))}°C</span>
          <span><span>Max:</span> {Math.max(...(tempData.map(i => i.value)))}°C</span>
          <span><span>Avg:</span> {(tempData.reduce( (a, i) => a + i.value,0)/tempData.length).toFixed(2)}°C</span>
          <span><span>Last:</span> {tempData[tempData.length-1]?.value}°C</span>
        </div>
        <ResponsiveContainer width="80%" height="60%" className="chartstyle">
          <LineChart setRange  data={tempData}>
            <Line connectNulls={true} dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              ticks={new Array(24).fill(0).map((v, i) => i*60)}
              tickFormatter={minToH}
              type="number"
              scale="linear"
              allowDataOverflow={true}
              domain={[0, 1440]}
              dataKey="createdAt"/>
            <YAxis domain={[-20, 40]} />
            <Tooltip labelFormatter={minToH}/>
          </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
