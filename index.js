const { SlobsClient } = require('slobs-client');
const axios = require('axios');
var fs = require('fs');

let client;

const streamName = 'test';
const sourceName = 'Low Bit Rate Detected';


var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
console.log(settings);

const main = async () => {
    while (true) {
        client = await SlobsClient.connect('http://localhost:59650/api', 'd3dd867da908f622d13162117e4d07c39b43e');

        const scenes = await client.request('SourcesService', 'getSources');

        let sources = settings.sources;
    
        for (let sourcesIndex = 0; sourcesIndex < sources.length; sourcesIndex++) {
            sources[sourcesIndex].bitrate = await axios.get('http://localhost:8080/source?sourceIdString=' + sources[sourcesIndex].restreamKey);

            for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
                if (scenes[sceneIndex].name.includes(settings.irlScenesName)) {
                    for (let nodeIndex = 0; nodeIndex < scenes.length; nodeIndex++) {
                        if (scenes[nodeIndex].name.includes(sources[sourcesIndex].inputStreamSource)) {
                            lowBitrate = sources[sourcesIndex].bitrate < sources[sourcesIndex].bitrateThreshold ? true : false;
                            if (sources[sourcesIndex].showing == null || sources[sourcesIndex].showing != lowBitrate) {
                                for (let nodeIndex2 = 0; nodeIndex2 < scenes.length; nodeIndex2++) {
                                    if (scenes[nodeIndex2].name.includes(sources[sourcesIndex].lowBitrateSource)) {
                                        client.request(scenes[nodeIndex2].resourceId, 'setVisibility', lowBitrate);
                                        sources[sourcesIndex].bitrate = lowBitrate;
                                    }
                                }
                            }
                        }
                    }



                    // if (scenes[sceneIndex].name == sources[sourcesIndex].inputStreamSource) {
                    //     let lowBitrate = (sources[sourcesIndex].bitrate < sources[sourcesIndex].bitrateThreshold) ? true : false
                    //     if (sources[sourcesIndex].showing == null || sources[sourcesIndex].showing != lowBitrate) {
                            
                    //     }
                    // }
                }
            }
        }


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

        await sleep(10000);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();