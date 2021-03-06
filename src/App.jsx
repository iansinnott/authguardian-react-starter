/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import OneGraphAuth from "onegraph-auth";
import fetchSupportedServicesQuery from "./fetchSupportedServices.js";
import "./App.css";
import { LoginWithTwitter } from "./TwitterSignIn";

const appId = process.env.REACT_APP_ONE_GRAPH_APP_ID;

const auth = new OneGraphAuth({
  appId: appId,
});

const gitHubLink =
  process.env.GITHUB_URL || "https://github.com/OneGraph/authguardian-react-starter";

const exampleUsage = (appId, service) => {
  const componentName = `LoginWith${service.friendlyServiceName.replace(/\W/g, "")}`;
  return `import OneGraphAuth from "onegraph-auth";

const auth = new OneGraphAuth({
  appId: "${appId}",
});

/* Usage:
  <${componentName} oneGraphAuth={auth} onLogin={() => console.log("User has successfully logged into ${service.friendlyServiceName}.")} />
*/
const ${componentName} = ({ oneGraphAuth, onLogin }) => {
  return (
    <button
      onClick={async () => {
        await oneGraphAuth.login("${service.slug}");
        const isLoggedIn = await oneGraphAuth.isLoggedIn("${service.slug}");
        if (isLoggedIn) {
          onLogin();
        }
      }}
    >
    Log in with ${service.friendlyServiceName}
    </button>
  );
};
`;
};

function corsPrompt(appId) {
  const origin = window.location.origin;

  return (
    <nav className="cors-prompt">
      <ul>
        <li>
          <a
            className="App-link"
            href={`https://www.onegraph.com/dashboard/app/${appId}?add-cors-origin=${origin}`}
            target="_blank"
            rel="noopener noreferrer">
            Please click here to add {origin} to your allowed CORS origins and then refresh
          </a>
        </li>
      </ul>
    </nav>
  );
}

const gitHubIcon = (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px">
    <title>GitHub icon</title>
    <path
      fill="white"
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    />
  </svg>
);

function navBar(appId) {
  return (
    <nav>
      <ul>
        <li>
          <a
            className="App-link"
            href={`https://www.onegraph.com/dashboard/app/${appId}/auth/auth-guardian`}
            target="_blank"
            rel="noopener noreferrer">
            Edit your rules
          </a>
        </li>
        <li>
          <a
            className="App-link"
            href="https://www.onegraph.com/docs/auth_guardian.html"
            target="_blank"
            rel="noopener noreferrer">
            AuthGuardian Docs
          </a>
        </li>
        <li>
          <a href={gitHubLink} target="_blank" rel="noopener noreferrer">
            {gitHubIcon}
          </a>
        </li>
      </ul>
    </nav>
  );
}

function Example() {
  const [state, setState] = useState({
    supportedServices: [],
    corsConfigurationRequired: null,
  });

  useEffect(() => {
    fetchSupportedServicesQuery(auth)
      .then((supportedServices) => {
        console.log(supportedServices);
        setState((oldState) => {
          return {
            ...oldState,
            supportedServices: supportedServices,
          };
        });
      })
      // Detect if we haven't configured CORS yet
      .catch((error) => {
        if (error.message && error.message.match("not allowed by Access-Control-Allow-Origin")) {
          setState((oldState) => {
            return { ...oldState, corsConfigurationRequired: true };
          });
        }
      });
  }, []);

  const accessToken = auth.accessToken();

  let decoded = null;

  if (!!accessToken) {
    try {
      const payload = atob(accessToken.accessToken.split(".")[1]);
      decoded = JSON.parse(payload);
      delete decoded["https://onegraph.com/jwt/claims"];
    } catch (e) {
      console.warn(`Error decoding OneGraph jwt for appId=${appId}: `, e);
    }
  }

  return (
    <div className="AppExample">
      {state.corsConfigurationRequired ? corsPrompt(appId) : navBar(appId)}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Your OneGraph auth <code>JWT</code> preview:
        </p>
        <textarea
          className="jwt-preview"
          rows={15}
          value={!!decoded ? JSON.stringify(decoded, null, 2) : "No OneGraph JWT"}
          readOnly={true}></textarea>
        <textarea
          className="jwt-preview"
          rows={1}
          value={!!accessToken && !!accessToken.accessToken ? accessToken.accessToken : ""}
          readOnly={true}></textarea>
        <button
          onClick={() => {
            auth.destroy();
            setState(() => {
              return { supportedServices: state.supportedServices };
            });
          }}>
          Clear local JWT
        </button>
        <p style={{ textAlign: "left" }}>
          {(state.supportedServices || []).map((service) => {
            return (
              <button
                key={service.slug}
                className="service-button"
                onClick={async () => {
                  await auth.login(service.slug);
                  const isLoggedIn = await auth.isLoggedIn(service.slug);
                  setState((oldState) => {
                    return {
                      ...oldState,
                      [service.slug]: isLoggedIn,
                      mostRecentService: service,
                    };
                  });
                }}>
                {!!state[service.slug] ? " ???" : ""}{" "}
                <p className="service-button-name">{service.friendlyServiceName}</p>
              </button>
            );
          })}
        </p>{" "}
        {!state.mostRecentService ? null : (
          <>
            <h3>
              Add 'Sign in with {state.mostRecentService.friendlyServiceName}' to your React app
            </h3>
            <textarea
              className="jwt-preview"
              style={{ marginBottom: "250px" }}
              rows={15}
              value={exampleUsage(appId, state.mostRecentService)}
              readOnly={true}></textarea>
          </>
        )}
      </header>
    </div>
  );
}

function App() {
  let tkn = null;
  try {
    tkn = JSON.parse(atob(auth.accessToken().accessToken.split(".")[1]));
  } catch (err) {
    console.warn("[warn] Could not parse token", err);
  }
  // const [loggedIn, setLoggedIn] = React.useState(!!tkn);
  // const [token, setToken] = React.useState(tkn);
  //
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [token, setToken] = React.useState(null);

  React.useEffect(() => {
    window.auth = auth;
  }, []);

  return (
    <div className="app">
      <h1>Sup</h1>
      {!token && (
        <LoginWithTwitter
          auth={auth}
          onLogin={(tkn) => {
            setLoggedIn(true);
            setToken(tkn);
          }}
        />
      )}
      {loggedIn ? (
        <div className="" style={{ marginTop: 10 }}>
          Logged in!
          {token && (
            <p>
              Heyo{" "}
              <span style={{ color: "teal", fontWeight: "bold" }}>
                @{token?.oauth?.twitter?.username}
              </span>
              <button
                onClick={(e) => {
                  auth.logout("twitter").then(() => {
                    setLoggedIn(false);
                    setToken(null);
                  });
                }}
                className=""
                style={{ display: "block", marginTop: 10 }}>
                Log Out
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="" style={{ marginTop: 10 }}>
          Unauthorized. Please log in with Twitter
        </div>
      )}
    </div>
  );
}

export default App;
