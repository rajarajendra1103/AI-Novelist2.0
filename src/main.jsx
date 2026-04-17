import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { StoryProvider } from './context/StoryContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoryProvider>
        <App />
      </StoryProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
