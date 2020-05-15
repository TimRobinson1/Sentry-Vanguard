import React from 'react';
import * as Icons from 'react-icons/fa';

type Props = {
  title: string;
  value: string | number;
  icon: string;
  status: string;
  isClickable: boolean;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
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

const Card = ({ title, value, icon, status, isClickable, onClick = () => {} }: Props) => {
  const Icon = (Icons as any)[icon];

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
        cursor: isClickable ? 'pointer' : 'cursor'
      }}
      onClick={isClickable ? onClick : () => {}}
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

export default Card;