import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
    <Link to="/" className="navbar-brand">AlgoTech Test App</Link>
    <div className="collpase navbar-collapse">
    <ul className="navbar-nav mr-auto">
      <li className="navbar-item">
      <Link to="/" className="nav-link">Users</Link>
      </li>
      <li className="navbar-item">
      <Link to="/createUser" className="nav-link">Create User</Link>
      </li>
      <li className="navbar-item">
      <Link to="/createGrade" className="nav-link">Create Grade</Link>
      </li>
    </ul>
    </div>
  </nav>
  )
}

export default NavBar
