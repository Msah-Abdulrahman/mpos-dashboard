import { useState, useEffect } from 'react';
import { db } from './firebase';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = db.collection('users');
        const snapshot = await userCollection.get();
        const userList = snapshot.docs.map((doc) => doc.data());
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
  }
  
  export default UserList