# Events app
Optimized for 1080x1920 resolution

### Resources
* https://github.com/bmathews/menubar-calendar
* https://github.com/crilleengvall/electron-tutorial-app
* https://github.com/Ivshti/linvodb3

### Install

With npm and node (v6+) installed, do:

```
$ npm install
```

Before you can start the app, you need Google OAuth client credentials with the Calendar API enabled:

1. Create a project here: https://console.developers.google.com/iam-admin/projects?pli=1
2. Go to the API Manager and enable the `Calendar API`
3. Create Credentials > OAuth Client Id, then choose "Other" as the application type

A `./secrets.json` file is required, with the following clientId and clientSecret:

```
{
  "oauth": {
    "clientId": "<your clientId>",
    "clientSecret": "<your clientSecret>"
  }
}
```
### npm scripts

Open dev tools when app is started with:
```
$ npm run dev
```

Clear out your local database with:
```
$ npm run clear-data
```

Generate packages for all OS
```
$ npm run build
```

### Statics
* SyncService.POLL_INTERVAL : fréquence de refresh (en ms) ==> 900000
* CalendarAPI.MAX_RESULTS : max result ==> 10
* CalendarAPI.KEENDOO_CALENDARID : calendarId ==> xxxyyycalendar.google.com
