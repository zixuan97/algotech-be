import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./frontend/NavBar";
import UserList from "./frontend/users/userList";
// import CreateGrade from "./components/edit-exercise.component"
// import EditUser from "./components/create-exercise.component"
// import CreateUser from "./components/create-user.component"

function App() {
  return (
    <>
      <Router>
        <div className="container">
          <Navbar />
          <br />
          <Routes>
            {/* <Route path="/" exact component={UserList} /> */}
            <Route path="/" element={<UserList />} />
          </Routes>

          {/* <Route path="/edit/:username" component={EditUser} />
          <Route path="/createUser" component={CreateUser} />
          <Route path="/createGrade" component={CreateGrade} /> */}
        </div>
      </Router>
    </>
  );
}

export default App;
