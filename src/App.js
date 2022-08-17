import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./frontend/NavBar"
import UserList from "./frontend/users/userList"
import CreateUser from "./frontend/users/createUser"
// import CreateGrade from "./components/edit-exercise.component"
// import EditUser from "./components/create-exercise.component"


function App() {
  return (
    <>
      <Router>
        <div className="container">
          <Navbar />
          <br />
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/createUser" element={<CreateUser />} />
          </Routes>

          {/* <Route path="/edit/:username" component={EditUser} />
          <Route path="/createGrade" component={CreateGrade} /> */}
        </div>
      </Router>
    </>
  );
}

export default App;
