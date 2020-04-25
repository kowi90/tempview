import React, { useEffect, useState } from 'react';
import './App.css';

const TODAY = 'today';
const HOURLY = 'hourly';
const WEEKLY = 'weekly';
const MONTHLY = 'monthly';

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

function createRange(range, lastTime) {
  const lastDate = new Date(lastTime);
  lastDate.setMinutes(0);
  lastDate.setSeconds(0);
  if (range === HOURLY) {
    return {
      createdAt_gte: lastDate.getTime()
    }
  }
  return {}
}

function z(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return num;
}

function getColor(v){
  const value= v/40;
  var hue=((1-value)*120).toString(10);
  return `hsl(${hue},100%,50%)`;
}

function App() {
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [order, setOrder] = useState('desc');
  const [range, setRange] = useState(null);
  const [tempData, setTempData] = useState([]);
  const [lastTime, setLastTime] = useState(null);

  const formatDate = date => {
    const dateObj = new Date(date);

    return `${dateObj.getFullYear()}-${z(dateObj.getMonth() + 1)}-${z(dateObj.getDate())} ${z(dateObj.getHours())}:${z(dateObj.getMinutes())}`;
  }
  const refreshTempData = () => {
    getTempData({
      ...(range ? {} : {_page: page}),
      ...(range ? {} : {_limit: limit}),
      _sort: 'id',
      _order: order,
      ...(range && lastTime ? createRange(range, lastTime) : {})
    }).then(data => {
      setTempData(data.reverse().map(({createdAt, value}) => ({
        createdAt: formatDate(createdAt),
        value
      })));
    })
  }

  const getLastTime = () => {
    getTempData({
      _page: 1,
      _limit: 1,
      _sort: 'id',
      _order: 'desc',
    }).then(data => {
      setLastTime(data[0].createdAt);
    })
  };

  useEffect(() => {
    getLastTime()
    refreshTempData()
  }, []);

  useEffect(() => {
    refreshTempData()
  }, [page]);

  const pagePrev = () => {
    if (!tempData.length) {
      return;
    }
    setPage(page => page+1);
  };

  const pageNext = () => {
    if (page === 1) {
      return;
    }
    setPage(page => page-1);
  };

  return (
    <div className="App">
      <div className = "pager">
        <div onClick={pagePrev} style={(tempData.length ? {} : {color : 'grey'})} >⮜Prev</div>
        <div onClick={pageNext} style={(page > 1 ? {} : {color : 'grey'})}>Next⮞</div>
      </div>
      <div className = "list">
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
      </div>
    </div>
  );
}

export default App;
