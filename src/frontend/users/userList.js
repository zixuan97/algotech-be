import { React, useState, useEffect } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/users/")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div>
        <h3>Users</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr>
                <td key={user._id}>{user.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserList;
