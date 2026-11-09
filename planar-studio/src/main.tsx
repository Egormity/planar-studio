import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import './styles/base.css';
import './styles/layout.css';
import './styles/library.css';
import './styles/inspection.css';
import './styles/editor.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
