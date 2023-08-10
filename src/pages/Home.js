import { useNavigate } from 'react-router-dom';
import { characters } from '../helpers/constants';

const Home = ({ username, setUsername, selectedChar, setSelectedChar, socket }) => {
  const navigate = useNavigate();
  
  const joinRoom = () => {
    if (username !== '') {
      socket.emit('join_room', { username, selectedChar, role: 'player' });
      navigate('/game', { replace: true });
    } else {
      console.log('Please enter username')
    }
  };
  
  return (
    <div className="home">
      <p>
        <span>ENTER YOUR NAME: </span><br />
        <input onChange={(e) => setUsername(e.target.value)} placeholder='Enter name...' />
      </p>
      <div className="char-selection-blk">
        <div>
          <p>SELECT YOUR CHARACTER:</p>
          <ul className='charSelectionList'>
            {
              characters.map(char => {
                return <li
                  key={char.name}
                  onClick={
                    () => setSelectedChar(char.name)} className={`home-selected-char ${selectedChar === char.name ? 'active' : ''}`
                  }>
                    <div className={`charSelectionImg ${char.name} ${selectedChar === char.name ? 'active' : ''}`}>
                      <img src='assets/characters.png' />
                    </div>
                </li>
              })
            }
          </ul>
        </div>
      </div>
      <div className="char-button-blk">
        <button onClick={()=> joinRoom()}>Join Game</button>
      </div>
      <button className="admin-button-blk" onClick={()=> navigate('/admin')}>Admin</button>
    </div>
  );
};

export default Home;