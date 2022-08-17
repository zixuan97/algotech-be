import { React, useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        axios
            .get('http://localhost:5000/users/', { signal: signal })
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                if (error.name === 'CanceledError') {
                    console.error('call to API was cancelled');
                } else {
                    console.log(error);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <>
            <div>
                <h3>Users</h3>
                <table className='table'>
                    <thead className='thead-light'>
                        <tr>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default UserList;
