import './style.css';
import { Game } from './game/Game';

const app = document.getElementById('app')!;
new Game(app).start();
