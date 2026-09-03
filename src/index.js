import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import reportWebVitals from './reportWebVitals';

const THEMES = ['light', 'dark', 'system', 'brand-dark', 'fintech'];
const savedTheme = localStorage.getItem('theme') || 'light';
const initialTheme = THEMES.includes(savedTheme) ? savedTheme : 'light';

document.documentElement.setAttribute('data-theme', initialTheme);
document.documentElement.setAttribute(
  'data-bs-theme',
  initialTheme === 'dark' || initialTheme === 'brand-dark' ? 'dark' : 'light'
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);

reportWebVitals();
