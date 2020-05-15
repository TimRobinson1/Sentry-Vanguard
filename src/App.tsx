import React, { useState } from 'react';
import chunk from 'lodash/chunk';
import styled from 'styled-components'

import { Card } from './components'
import './App.css';

import useDataService from './hooks/use-data-service';

type Props = {}

const IssueLink = styled.a`
  text-align: left;
  display: block;
  border: 1px solid gray;
  padding: 1rem;
  background-color: #FFF;
  text-decoration: none;
  cursor: pointer;
  color: #2b6fb3;
  width: 762px;
  &:hover {
    color: #7B8FA5
  }
`;

const BackButton = styled.div`
  text-align: left;
  display: block;
  border: 1px solid gray;
  padding: 1rem;
  background-color: #FFF;
  text-decoration: none;
  cursor: pointer;
  width: 762px;
  &:hover {
    background-color: #708090
  }
`;

const getList = (status: string, summary: any) => {
  const summarySection = summary[status];

  return (summarySection && summarySection.issues) || [];
}

const App: React.FC<Props> = (props: Props) => {
  const [ listStatus, setListStatus ] = useState<string | null>(null);
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

  // TODO: Type me
  const data = Object.entries(rawData.summary.summary) as [any, any];
  const rows = chunk(data, 3);

  return (
    <div className="App" style={{ color: '#FFFFFF' }}>
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ margin: '0 auto' }}>
          {!!listStatus ? (
            <div style={{ color: '#000000' }}>
              <BackButton onClick={() => setListStatus(null)}>
                <span role="img" aria-label="back">🔙</span> Back to overview
              </BackButton>
              {getList(listStatus, rawData.summary.summary).map((issue: any) => (
                <IssueLink target="_blank" href={`//${issue.issueUrl}`}>
                  {issue.title}
                </IssueLink>
              ))}
            </div>
          ) : (
            <>
              {rows.map(row => (
                <div style={{ display: 'flex' }}>
                  {row.map(([title, entry]) => (
                    <Card
                      title={title}
                      value={entry.value}
                      icon={entry.icon}
                      status={entry.status}
                      isClickable={rawData.summary.summary[title] && rawData.summary.summary[title].issues && rawData.summary.summary[title].issues.length}
                      onClick={() => {
                        setListStatus(title);
                      }}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App;
