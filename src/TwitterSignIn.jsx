import React from "react";

/* Usage:
  <LoginWithTwitter oneGraphAuth={auth} onLogin={() => console.log("User has successfully logged into Twitter.")} />
*/
export function LoginWithTwitter({ auth, onLogin }) {
  return (
    <button
      onClick={async () => {
        await auth.login("twitter");
        const isLoggedIn = await auth.isLoggedIn("twitter");
        if (isLoggedIn) {
          let tkn = null;
          try {
            tkn = JSON.parse(atob(auth.accessToken().accessToken.split(".")[1]));
          } catch (err) {
            console.warn("[warn] Could not parse token");
          }
          onLogin(tkn);
        }
      }}>
      Log in with Twitter
    </button>
  );
}
