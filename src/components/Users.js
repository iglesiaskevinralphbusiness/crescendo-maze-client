import { useState, useEffect } from 'react';

const Users = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('room_users', (data) => {
      const sortedData = data.sort((a, b) => parseFloat(b.rank) - parseFloat(a.rank));
      setUsers(sortedData);
    });

    return () => socket.off('room_users');
  }, [socket]);

  return (
    <div className="users">
      <table border="0">
        <thead>
          <tr>
            <td className="users-no">RANK</td>
            <td className="users-username">NAME</td>
            <td className="users-status">STATUS</td>
            <td className="users-time">LOCATION</td>
          </tr>
        </thead>
        <tbody>
          { users.map((user, index) => {
            
            return <tr key={user.id}>
              <td className="users-no">{user.status == 'finished' ? user.rank : '-'}</td>
              <td className="users-username">{user.username}</td>
              <td className={user.status}>{user.status}</td>
              <td className="users-time">{user.position.x}:{user.position.y}</td>
            </tr>}
          ) }
        </tbody>
      </table>
    </div>
  );
};

export default Users;