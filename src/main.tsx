import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import  './utils/global';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const Root = () => {
  return <App />;
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);






