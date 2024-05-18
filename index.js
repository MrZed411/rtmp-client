const { SlobsClient } = require('slobs-client');
const axios = require('axios');
var fs = require('fs');
const { exit } = require('process');

var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

const main = async () => {
    console.log("Starting Program");

    let streamlabsClient = await SlobsClient.connect(settings.streamlabsURL, settings.streamlabsApiKey);

    settings.previousScene = await streamlabsClient.request('ScenesService', 'activeScene');

    while (true) {
        //Go through each irl source
        for (let irlSource of settings.irlSources) {
            //Get the current bitrate for that source
            bitrateRaw = await axios.get(settings.bitrateStatURL + '/source?sourceIdString=' + irlSource.restreamKey);
            irlSource.bitrate = bitrateRaw.data;

            console.log("Current bitrate for [" + irlSource.name + "]: " + irlSource.bitrate);

            //Check for low/no bitrate
            lowBitrate = irlSource.bitrate < irlSource.bitrateThreshold ? true : false;
            noBitrate = irlSource.bitrate < settings.brbBitrateThreshold ? true : false;

            //If the bitrate is the same as last check, move to next source
            if (lowBitrate == irlSource.lowBitrate && noBitrate == irlSource.noBitrate) {
                continue;
            }

            //Something is different
            let scenes = await streamlabsClient.request('ScenesService', 'getScenes');

            if (irlSource.lowBitrate != lowBitrate ) {
                for (let scene of scenes) {
                    if (irlSource.enabledScenes.includes(scene.name)) {
                        for (let node of scene.nodes) {
                            if (node.name == irlSource.lowBitrateSource) {
                                console.log("Bitrate has changed, setting visibility of " + node.name + " to " + lowBitrate);
                                await streamlabsClient.request(node.resourceId, 'setVisibility', lowBitrate);
                            }
                        }
                    }
                }
                irlSource.lowBitrate = lowBitrate;
            }

            if (irlSource.noBitrate != noBitrate) {
                let activeScene = await streamlabsClient.request('ScenesService', 'activeScene');
                if (noBitrate) {
                    if (irlSource.enabledScenes.includes(activeScene.name)) {
                        //Make brb scene active 
                        for (let scene of scenes) {
                            if (scene.name == settings.brbSceneName) {
                                console.log("No bitrate has been detected, changing to the BRB Screen.");
                                await streamlabsClient.request(scene.resourceId, 'makeActive');
                                settings.previousScene = activeScene;
                            }
                        }
                    }
                } else {
                    if (activeScene.name == settings.brbSceneName) {
                        if (settings.previousScene.name == settings.brbSceneName) {
                            //The brb scene was the last active, set to the default scene
                            console.log("Bitrate has been detected again, the brb scene was the previous detected scene, switching to the default scene for this source.");
                            for (let scene of scenes) {
                                if (scene.name == irlSource.defaultScene) {
                                    await streamlabsClient.request(scene.resourceId, 'makeActive');
                                }
                            }
                        } else {
                            //Make the previous scene active
                            console.log("Bitrate has been detected again, switching back to previous scene.");
                            await streamlabsClient.request(settings.previousScene.resourceId, 'makeActive');
                        }
                    }
                }
                irlSource.noBitrate = noBitrate;
            }
        }

        //Restart the while loop
        await sleep(3000);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();