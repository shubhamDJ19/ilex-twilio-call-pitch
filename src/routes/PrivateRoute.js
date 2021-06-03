import React from "react";
import { Route, Redirect } from "react-router-dom";
import { withFirebase } from "../firebase";
import withAuthentication from "../session/withAuthentication";
import { AuthUserContext } from "../session";

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => (
        <AuthUserContext.Consumer>
          {(authUser) =>
            authUser ? (
              <Component {...props} />
            ) : (
              <Redirect
                to={{ pathname: "/login", state: { referer: props.location } }}
              />
            )
          }
        </AuthUserContext.Consumer>
      )}
    />
  );
}

export default withAuthentication(PrivateRoute);
