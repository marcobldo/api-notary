/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';

var StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('hex');

// Declaring a class
class LevelSandbox {
	// Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
  	// Get data from levelDB with key (Promise)
  	getLevelDBData(key){
        let self = this; // because we are returning a promise we will need this to be able to reference 'this' inside the Promise constructor
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    let parsedBlockData = JSON.parse(value);
                    if (parsedBlockData) {
                        if (parsedBlockData.body.star) {
                            if (parsedBlockData.body.star.story) {
                                var isCorrectlyDecoded = false;
                                var decodedStoryData = null;
                                try {
                                    let buffer = new Buffer.from(parsedBlockData.body.star.story, 'hex').toString();
                                    decodedStoryData = decoder.write(buffer);
                                    isCorrectlyDecoded = true;
                                    console.log(buffer);
                                } catch (err) {
                                    if (err.message) {
                                        console.log(err.message);
                                        reject(err.message);
                                    } else {
                                        console.log(err);
                                        reject(err);
                                    }
                                }
                                if (isCorrectlyDecoded && decodedStoryData) {
                                    parsedBlockData.body.star.decodedStory = decodedStoryData;
                                    console.log("Star.story decoded correctly");
                                    console.log(decodedStoryData);


                                } else {
                                    console.log("Star.story can not be decoded");

                                }
                            }
                        } else {
                            console.log("getAllBlocksByAddress, matching address, but start valud is invalid");
                        }
                    }
                    resolve(parsedBlockData);
                }
            });
        });
    }
  
  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }
  
  	/**
     * Step 2. Implement the getBlocksCount() method
     */
    getBlocksCount() {
        let self = this;
        let dataArray = [];
        return new Promise(function (resolve, reject) {
            console.log("getBlocksCount");
            self.db.createReadStream()
                .on('data', function (data) {
                    dataArray.push(data);
                })
                .on('error', function (err) {
                    console.log('getBlocksCount!', err);
                    reject(err);
                })
                .on('close', function () {
                    console.log('Stream closed');
                    resolve(dataArray.length);
                })
                .on('end', function () {
                    console.log('Stream ended');
                    resolve(dataArray.length);
                });
            
        });
    }

    getAllBlocksByAddress(walletAddress) {
        let self = this;
        let dataArray = [];
        return new Promise(function (resolve, reject) {
            console.log("getBlocksCount");
            self.db.createReadStream()
                .on('data', function (data) {
                    let parsedBlockData = JSON.parse(data.value);
                    if (walletAddress === parsedBlockData.body.address) {
                        if (parsedBlockData.body.star) {
                            if (parsedBlockData.body.star.story) {
                                var isCorrectlyDecoded = false;
                                var decodedStoryData = null;
                                try {
                                    let buffer = new Buffer.from(parsedBlockData.body.star.story,'hex').toString();
                                    decodedStoryData = decoder.write(buffer);
                                    isCorrectlyDecoded = true;
                                    console.log(buffer);
                                } catch (err) {
                                    if (err.message) {
                                        console.log(err.message);
                                        reject(err.message);
                                    } else {
                                        console.log(err);
                                        reject(err);
                                    }
                                }
                                if (isCorrectlyDecoded && decodedStoryData) {
                                    parsedBlockData.body.star.decodedStory = decodedStoryData;
                                    console.log("Star.story decoded correctly");
                                    console.log(decodedStoryData);

                                } else {
                                    console.log("Star.story can not be decoded");

                                }
                            }
                        } else {
                            console.log("getAllBlocksByAddress, matching address, but start valud is invalid");
                        }
                        dataArray.push(parsedBlockData);
                    }
                })
                .on('error', function (err) {
                    console.log('getBlocksCount!', err);
                    reject(err);
                })
                .on('close', function () {
                    console.log('Stream closed');
                    resolve(dataArray);
                })
                .on('end', function () {
                    //console.log('Stream ended');
                    //resolve(dataArray);
                });

        });
    }


    findBlockByHash(hashBlock) {
        let self = this;
        let startFounded = null;
        return new Promise(function (resolve, reject) {
            console.log("Reading ledger...");
            console.log("findind hasBLock: " + hashBlock);

            self.db.createReadStream()
                .on('data', function (data) {
                    let parsedBlockData = JSON.parse(data.value);
                    if (parsedBlockData.hash === hashBlock) {
                        console.log("Star hash founded");
                        if (parsedBlockData.body.star) {
                            if (parsedBlockData.body.star.story) {
                                var isCorrectlyDecoded = false;
                                var decodedStoryData = null;
                                try {
                                    let buffer = new Buffer.from(parsedBlockData.body.star.story, 'hex').toString();
                                    decodedStoryData = decoder.write(buffer);
                                    isCorrectlyDecoded = true;
                                    console.log(buffer);
                                } catch (err) {
                                    if (err.message) {
                                        console.log(err.message);
                                        reject(err.message);
                                    } else {
                                        console.log(err);
                                        reject(err);
                                    }
                                }
                                if (isCorrectlyDecoded && decodedStoryData) {
                                    parsedBlockData.body.star.decodedStory = decodedStoryData;
                                    console.log("Star.story decoded correctly");
                                    console.log(decodedStoryData);

                                } else {
                                    console.log("Star.story can not be decoded");

                                }
                            }
                        } else {
                            console.log("getAllBlocksByAddress, matching address, but start valud is invalid");
                        }
                        //console.log(data.value);
                        startFounded = parsedBlockData;
                    }
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    console.log('Stream closed');
                    if (!startFounded) {
                        console.log('Start not founded with hash: '+hashBlock);
                    }
                    resolve(startFounded);
                })
                .on('end', function () {
                    console.log('Stream ended');
                    resolve(startFounded);
                });

        });
    }
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;