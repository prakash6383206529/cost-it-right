import { LogLevel } from "@azure/msal-browser";
import { getConfigurationKey } from './helper/auth'

export const msalConfig = {

  auth: {
    clientId: getConfigurationKey()?.ClientId,
    authority: getConfigurationKey()?.Authority,
    redirectUri: getConfigurationKey()?.RedirectURL
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
