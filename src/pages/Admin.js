import { useState, useEffect } from 'react';
import Users from '../components/Users';

const Admin = ({ room, socket }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const adminPassword = '1234';

  const enterAdmin = () => {
    if(password === adminPassword){
      socket.emit('join_room', { username: 'Admin', role: 'admin' });
      setIsAdmin(true);
    } else {
      console.log('Wrong admin password!');
    }
  }

  const start = () => {
    socket.emit('game_start');
  };
  
  if(!isAdmin){
    return (
      <div className="admin">
        <input onChange={(e) => setPassword(e.target.value)} placeholder='Password...' />
        <button onClick={()=> enterAdmin()}>Enter Admin</button>
      </div>
    );
  }

  return (
    <div className="admin">
      <button onClick={() => start()}>start</button>
      <Users socket={socket} />
    </div>
  )
};

export default Admin;