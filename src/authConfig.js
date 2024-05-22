import { LogLevel } from "@azure/msal-browser";


export const msalConfig = {
  auth: {
    clientId: "e8df7aec-28a2-4e03-bda9-a8e4029a404c",
    authority:
      "https://login.microsoftonline.com/2b0a3b04-16bd-4638-be57-5622527eb55e",
    redirectUri: "http://localhost:3001/",


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
  scopes: ["https://graph.windows.net/User.Read"],
};
