import React from "react";

/* Usage:
  <LoginWithTwitter oneGraphAuth={auth} onLogin={() => console.log("User has successfully logged into Twitter.")} />
*/
export function LoginWithTwitter({ auth, onLogin }) {
  debugger;
  return (
    <button
      onClick={async () => {
        await auth.login("twitter");
        const isLoggedIn = await auth.isLoggedIn("twitter");
        if (isLoggedIn) {
          onLogin();
        }
      }}>
      Log in with Twitter
    </button>
  );
}
