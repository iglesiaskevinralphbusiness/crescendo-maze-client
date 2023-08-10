import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './pages/Home';
import Game from './pages/Game';
import Admin from './pages/Admin';

const socket = io.connect('https://crescendo-maze-socket.onrender.com');

function App() {
  const [username, setUsername] = useState('');
  const [selectedChar, setSelectedChar] = useState('adventurer01');

  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={
              <Home
                username={username}
                setUsername={setUsername}
                selectedChar={selectedChar}
                setSelectedChar={setSelectedChar}
                socket={socket}
              />
            }
          />
          <Route path='/game' element={
              <Game
                username={username}
                selectedChar={selectedChar}
                socket={socket}
                role="player"
              />
            }
          />
          <Route path='/admin' element={
              <Admin socket={socket} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
