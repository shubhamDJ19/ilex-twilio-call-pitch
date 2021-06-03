// eslint-disable-next-line no-unused-vars
import React, { Component } from "react";
import { createHashHistory } from "history";
import { FirebaseContext } from "../firebase";

export const history = createHashHistory();

class Loader extends Component {
  static contextType = FirebaseContext;

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (this.context.auth.currentUser == null) {
      history.push("/login");
    }
  }

  render() {
    return (
      <div className="page-level-loader">
        <img src="assets/images/loader.gif" alt="Loader" width="50" />
      </div>
    );
  }
}

export default Loader;
