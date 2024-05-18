const { SlobsClient } = require('slobs-client');
const axios = require('axios');
var fs = require('fs');

let client;

const streamName = 'test';
const sourceName = 'Low Bit Rate Detected';


var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
console.log(settings);

const main = async () => {
    //Get the sources from settings file
    let sources = settings.sources;
    while (true) {
        //Check each source for low bitrate
        for (let sourcesIndex = 0; sourcesIndex < sources.length; sourcesIndex++) {
            //Get the bitrate for the source
            bitrateRaw = await axios.get(settings.bitrateStatURL + '/source?sourceIdString=' + sources[sourcesIndex].restreamKey);
            sources[sourcesIndex].bitrate = bitrateRaw.data;
            
            console.log("Current Bitrate: " + sources[sourcesIndex].bitrate);

            lowBitrate = sources[sourcesIndex].bitrate < sources[sourcesIndex].bitrateThreshold ? true : false;
            noBitrate = sources[sourcesIndex].bitrate == 0 ? true : false;

            //If the bitrate isn't defined or is different from last value
            if (sources[sourcesIndex].lowBitrate == null || sources[sourcesIndex].lowBitrate != lowBitrate || (noBitrate && sources[sourcesIndex].noBitrate != noBitrate && sources[sourcesIndex].noBitrate != null)) {
                console.log("Bitrate Change Detected");
                //Connect to streamlabs and get all scenes
                client = await SlobsClient.connect(settings.streamlabsURL, settings.streamlabsApiKey);
                const scenes = await client.request('ScenesService', 'getScenes');

                if (sources[sourcesIndex].lowBitrate == null || sources[sourcesIndex].lowBitrate) {
                    //Search through all scenes to find any with our given prefix for lowbitrate detection
                    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
                        if (scenes[sceneIndex].name.includes(settings.irlScenesName)) {
                            console.log("Found matching scene name");
                            //Search through all nodes in the given scene for the node that has a bitrate change
                            scene = scenes[sceneIndex];
                            for (let nodeIndex = 0; nodeIndex < scene.nodes.length; nodeIndex++) {
                                inputStreamNode = scene.nodes[nodeIndex];
                                if (inputStreamNode.name.includes(sources[sourcesIndex].inputStreamSource)) {
                                    //Search through all nodes in the given scene for the node that is the low bitrate detection node
                                    for (let nodeIndex2 = 0; nodeIndex2 < scene.nodes.length; nodeIndex2++) {
                                        lowbitrateNode = scene.nodes[nodeIndex2];
                                        if (lowbitrateNode.name.includes(sources[sourcesIndex].lowBitrateSource)) {
                                            //Set the visibility of the node and save the value to settings
                                            client.request(lowbitrateNode.resourceId, 'setVisibility', lowBitrate);
                                            sources[sourcesIndex].lowBitrate = lowBitrate;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (noBitrate || (sources[sourcesIndex].noBitrate != noBitrate)) {
                    console.log("Detected No Bitrate");
                    if (noBitrate && sources[sourcesIndex].noBitrate != noBitrate) {
                        //Search through all scenes to find the nobitrate scene
                        for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
                            if (scenes[sceneIndex].name.includes(settings.brbSceneName)) {
                                console.log(scenes[sceneIndex].resourceId);
                                settings.previousScene = await client.request('ScenesService', 'activeScene');
                                sources[sourcesIndex].noBitrate = noBitrate;
                                await client.request(scenes[sceneIndex].resourceId, 'makeActive');
                            }
                        }
                    } else if (!noBitrate) {
                        if (settings.previousScene) {
                            await client.request(settings.previousScene.resourceId, 'makeActive');
                            sources[sourcesIndex].noBitrate = noBitrate;
                        } else {
                            for (let scene in scenes) {
                                if (scene.name == sources[sourcesIndex].enabledScene) {
                                    await client.request(scene.resourceId, 'makeActive');
                                }
                            }
                        }
                    }
                }
            }
        };






        // //Rewrite this
        // client = await SlobsClient.connect('http://localhost:59650/api', 'd3dd867da908f622d13162117e4d07c39b43e');

        // const scenes = await client.request('ScenesService', 'getScenes');

        // //let sources = settings.sources;
    
        // for (let sourcesIndex = 0; sourcesIndex < sources.length; sourcesIndex++) {
        //     bitrateRaw = await axios.get(settings.bitrateStatURL + '/source?sourceIdString=' + sources[sourcesIndex].restreamKey);
        //     sources[sourcesIndex].bitrate = bitrateRaw.data;
        //     console.log(sources[sourcesIndex].bitrate);

        //     for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        //         if (scenes[sceneIndex].name.includes(settings.irlScenesName)) {
        //             for (let nodeIndex = 0; nodeIndex < scenes.length; nodeIndex++) {
        //                 if (scenes[nodeIndex].name.includes(sources[sourcesIndex].inputStreamSource)) {
        //                     lowBitrate = sources[sourcesIndex].bitrate < sources[sourcesIndex].bitrateThreshold ? true : false;
        //                     console.log("Low bitrate:", lowBitrate);
        //                     if (sources[sourcesIndex].showing == null || sources[sourcesIndex].showing != lowBitrate) {
        //                         for (let nodeIndex2 = 0; nodeIndex2 < scenes.length; nodeIndex2++) {
        //                             if (scenes[nodeIndex2].name.includes(sources[sourcesIndex].lowBitrateSource)) {
        //                                 console.log("Sending new bitrate", lowBitrate);
        //                                 client.request(scenes[nodeIndex2].resourceId, 'setVisibility', lowBitrate);
        //                                 sources[sourcesIndex].bitrate = lowBitrate;
        //                             }
        //                         }
        //                     }
        //                 }
        //             }



        //             // if (scenes[sceneIndex].name == sources[sourcesIndex].inputStreamSource) {
        //             //     let lowBitrate = (sources[sourcesIndex].bitrate < sources[sourcesIndex].bitrateThreshold) ? true : false
        //             //     if (sources[sourcesIndex].showing == null || sources[sourcesIndex].showing != lowBitrate) {
                            
        //             //     }
        //             // }
        //         }
        //     }
        // }


        // // let bitrate = await axios.get('http://localhost:8080/source?sourceIdString=' + streamName);
        // let highbitrate = bitrate.data < 2500000 ? true : false;
        // // get a list of sources

        // const scenes = await client.request('ScenesService', 'getScenes');


        // scenes.forEach(scene => {
        //     if (scene.name.includes("IRL")) {
        //         scene.nodes.forEach(node => {
        //             if (node.name.includes("Low Bitrate Detected")) {
        //                 client.request(node.resourceId, 'setVisibility', highbitrate);
        //             }
        //         })
        //     }
        // });

        await sleep(3000);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();