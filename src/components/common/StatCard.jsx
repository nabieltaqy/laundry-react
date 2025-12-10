import React from 'react';

export const StatCard = ({ icon: Icon, label, value, subtitle, color = 'blue' }) => {
  const colorClass = {
    blue: 'stat-primary',
    green: 'stat-green',
    yellow: 'stat-yellow',
    red: 'stat-red',
  }[color];

  return (
    <div className="card stat-card">
      <div className={`stat-icon ${colorClass}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p style={{margin:0,color:'var(--muted)'}}>{label}</p>
        <p style={{marginTop:8,fontSize:22,fontWeight:700}}>{value}</p>
        {subtitle && <p style={{marginTop:6,color:'var(--muted)'}}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
