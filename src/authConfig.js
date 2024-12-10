import { LogLevel } from "@azure/msal-browser";
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: process.env.REACT_APP_TENANT_ID,
    redirectUri: process.env.REACT_APP_REDIRECT_URI
  },


  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            return;

          case LogLevel.Info:
            return;

          case LogLevel.Verbose:
            return;

          case LogLevel.Warning:
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["https://graph.microsoft.com/User.Read"],
};
