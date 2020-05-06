import React from 'react';
import qs from 'qs';
import chunk from 'lodash/chunk';
import { Chart } from 'react-charts'
import * as Icons from 'react-icons/fa';
import './App.css';

import infoData from './data/index.js';

const chartData = [
  {
    label: 'Series 1',
    data: [[0, 1], [1, 2], [2, 4], [3, 2], [4, 7]]
  },
  {
    label: 'Series 2',
    data: [[0, 3], [1, 1], [2, 5], [3, 6], [4, 4]]
  }
];
const axes = [
  { primary: true, type: 'linear', position: 'bottom' },
  { type: 'linear', position: 'left' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'good':
      return '#85DE77';
    case 'neutral':
      return '#708090'
    case 'okay':
      return '#F3B600';
    default:
      return '#FF756D';
  }
}

const InfoCard = ({ title, value, icon, status }) => {
  const Icon = Icons[icon];

  const backgroundColor = getStatusColor(status);

  return (
    <div
      style={{
        width: '250px',
        height: '200px',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '5px',
        border: '2px solid #FFFFFF',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
        <em>{title}</em>
      </div>
      <div style={{
        width: '150px',
        height: '60px',
      }}>
        {!!Icon && (<Icon style={{ width: '100%', height: '100%' }} />)}
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>
        {value}
      </div>
    </div>
  )
}

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      data: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.setState({
      data: qs.parse(window.location.search),
      loading: false,
    });
  }

  renderBody () {
    if (!this.state.data) {
      return null;
    }

    if (this.state.data.type === 'chart') {
      return (
        <div
          style={{
            width: '400px',
            height: '300px',
          }}
        >
          <Chart data={chartData} axes={axes} tooltip />
        </div>
      )
    }

    if (this.state.data.type === 'info') {
      const data = Object.entries(infoData.summary);
      const rows = chunk(data, 3);

      return (
        <div style={{ width: '100%', display: 'flex' }}>
          <div style={{ margin: '0 auto' }}>
            {rows.map(row => (
              <div style={{ display: 'flex' }}>
                {row.map(([title, entry]) => (
                  <InfoCard
                    title={title}
                    value={entry.value}
                    icon={entry.icon}
                    status={entry.status}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
  
  render() {
    return (
      <div className="App" style={{ color: '#FFFFFF' }}>
          {this.renderBody()}
      </div>
    );
  }
}

export default App;
