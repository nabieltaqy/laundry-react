import React from 'react';

export const MainLayout = ({ children }) => {
  return (
    <div className="main">
      <header className="header">
        <div className="wrap">
          <h2 style={{margin:0,fontWeight:700}}>Laundry Management System</h2>
        </div>
      </header>

      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
