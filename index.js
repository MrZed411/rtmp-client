const { SlobsClient } = require('slobs-client');
const axios = require('axios');

let client;

const streamName = 'test';
const sourceName = 'Low Bit Rate Detected';

const main = async () => {
    while (true) {
        client = await SlobsClient.connect('http://localhost:59650/api', 'd3dd867da908f622d13162117e4d07c39b43e');

        let bitrate = await axios.get('http://localhost:8080/source?sourceIdString=' + streamName);
        let highbitrate = bitrate.data < 2500000 ? true : false;
        // get a list of sources
        const scenes = await client.request('ScenesService', 'getScenes');

        scenes.forEach(scene => {
            if (scene.name.includes("IRL")) {
                scene.nodes.forEach(node => {
                    if (node.name.includes("Low Bitrate Detected") && node.) {
                        client.request(node.resourceId, 'setVisibility', highbitrate);
                    }
                })
            }
        });

        await sleep(10000);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();