# Install instructions
## Requirements:
- NodeJS (https://nodejs.org/en)
- Streamlabs OBS (https://streamlabs.com/)

### Setup the repo
1. Open command prompt and navigate to where the application will be stored
    - `cd` to move around (ex: `cd Desktop`)
2. Clone the repo from Github
    - `git clone https://github.com/MrZed411/rtmp-client.git`
3. Open the folder
    - `cd rtmp-client`
4. Install the libraries used by the app
    - `npm install`
5. Create a settings.json file
    - Either copy the settings.json.example file or build one just like it. Settings are explained in detail below.
6. Setup Streamlabs OBS API
    - Follow the instruction set below for that
7. Once all settings have been set, run the application
    - `node .\index.js`
    - In order to run the app, you must open command prompt to the app folder and run above command. If you want to stop the app either press CTRL + C multiple times or close the command prompt window.

### Setup Streamlabs OBS API
1. Open Streamlabs OBS
2. Open Settings
3. Go to "Remote Control"
4. Click the QR Code to enable the show details button
5. Click the show details button
6. Click the visibility button in the API Token section to show the API Token
7. Copy the API Token and put it in your settings.json file


# Settings File
## Explainations
- __streamlabsURL__ - This is the URL to your Streamlabs OBS. If you are running this app on the same computer as Streamlabs OBS it would most likely be `http://localhost:59650/api`
- __streamlabsApiKey__ - This is the API key for accessing the Streamlabs OBS API. Instructions for how to get this are above.
- __brbSceneName__ - This is the name of the scene to switch to when the bitrate has dropped too low to continue showing the camera. This should be the exact same as listed in Streamlabs OBS. Please have this be named unique from all other scenes.
- __brbBitrateThreshold__ - This is how low the bitrate needs to go for the brb scene to be switched to. If you set this too low it can keep showing the camera even when it is not showing anything good. If you set this too high it can switch to the brb scene prematurely. You might want to change this depending on any network issues the IRL camera might be having. A good starting value is `400000` and could be increased/decreased from there.
- __bitrateStatURL__ - This is the URL that provides the bitrate of a given source. Should be a simple API returning just the bitrate value as an int and nothing else.
- __irlSources__ - This is the list of IRL Sources that are being input. The example settings json only has one IRL source, if you would like multiple to be tracked copy everything between the curly brackets in this section and add it after closing curly brackets with a comma between them. If you were to only look at the brackets/comma it would look like this for 3 IRL sources `[{},{},{}]`. Each source should be a unique input
    - __name__ - Name of the IRL Source. This is only used for logging to let you know what the application is doing.
    - __enabledScenes__ - This is a list of scene names that the application can do actions for. For example, if you have an "IRL" scene and only want the bitrate detection when that scene is active, add it to this list. If you have 3 scenes in this list it should look like this `["","",""]` which each scene name being in the quotation marks.
    - __restreamKey__ - This is the Stream key for the IRL Source from the restreaming server. This is NOT your twitch/youtube/etc Stream Key but the stream key used to stream your IRL Camera to the restreaming server.
    - __lowBitrateSource__ - This is the name of the source to have visible when the bitrate is low but not enough to go to the BRB screen. Typically this will be an image or textfield. The name is checking for an exact match and should be unique to this source.
    - __bitrateThreshold__ - This is how low the bitrate needs to go for the low bitrate source to be shown. If you set this too low it won't show until the quality is very low. If you set this too high it would show even when the quality is okay. You might want to change this depending on network issues the IRL Camera might be having. You can also look at the stream quality when this gets enabled/disabled to change the value. A good starting value is `1800000` and could be increased/decreased from there.

## Example settings.json File
``` 
{
    "streamlabsURL": "http://localhost:59650/api",
    "streamlabsApiKey": "abc123def456ghi789jkl",
    "brbSceneName": "Be Right Back",
    "brbBitrateThreshold": 400000,
    "bitrateStatURL": "http://restreamingserver/api",
    "irlSources": [
        {
            "name": "GoPro",
            "enabledScenes": ["GoPro IRL"],
            "defaultScene": "GoPro IRL",
            "restreamKey": "1234abcd5678efgh",
            "lowBitrateSource": "Low Bitrate Detected",
            "bitrateThreshold": 4000000
        }
    ]
}
```


## Possible TODO:
* Add the ability to allow brb screen to rely on multiple sources