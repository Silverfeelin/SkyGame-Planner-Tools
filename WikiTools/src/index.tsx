import { createRoot } from 'react-dom/client';
import './App.scss';
import App from './App';

const el = document.createElement('div');
el.classList.add('wikitools-root');
document.body.appendChild(el);

const root = createRoot(el);
root.render(<App />);