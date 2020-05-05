import React from 'react';
import qs from 'qs';
import { Chart } from 'react-charts'

import logo from './logo.svg';
import './App.css';

const data = [
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
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div
            style={{
              width: '400px',
              height: '300px'
            }}
          >
          <Chart data={data} axes={axes} />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
