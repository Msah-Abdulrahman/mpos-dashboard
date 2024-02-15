import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';

import { db } from './firebase';


const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map(doc => doc.data());
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers()
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.uid}>
            {user.username} ({user.uid})
          </li>
        ))}
      </ul>
    </div>
  );
  }
  
  export default UserList