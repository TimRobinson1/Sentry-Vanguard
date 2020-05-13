import React from 'react';
import chunk from 'lodash/chunk';
import { Card } from './components'
import './App.css';

import useDataService from './hooks/use-data-service';

type Props = {}

const App: React.FC<Props> = (props: Props) => {
  const { data: rawData, loading, error } = useDataService(
    'issues',
    process.env.REACT_APP_VANGUARD_ISSUES_ID
  );

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>ERR: {error}</p>;
  }

  const data = Object.entries(rawData.summary.summary) as [any, any];
  const rows = chunk(data, 3);

  return (
    <div className="App" style={{ color: '#FFFFFF' }}>
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ margin: '0 auto' }}>
          {rows.map(row => (
            <div style={{ display: 'flex' }}>
              {row.map(([title, entry]) => (
                <Card
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
    </div>
  )
}

export default App;
