/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const Block = require('../models/Block.js');
//Importing levelSandbox class
const LevelSandboxClass = require('../controlleres/LevelSandbox.js');
const db = new LevelSandboxClass.LevelSandbox();


class Blockchain {

    constructor() {
        //this.chain = new LevelSandbox.LevelSandbox();
        this.chain = [];
        this.generateGenesisBlock();
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        if(this.chain.length===0){
            let newBlock =  new Block.Block();
            newBlock.height = 0;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            // previous block hash
            newBlock.previousBlockHash = '';
            newBlock.body = 'Genesis Block!';
            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            //this.chain.push(newBlock);

            db.addLevelDBData(0,JSON.stringify(newBlock).toString()).then((result) => {
                //console.log("BLock added: " + result);
            }).catch((err) => { console.log(err);});

        }

    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    getBlockHeight() {
        return new Promise (function (resolve,reject){
            db.getBlocksCount().then(
                (actualBlockHeght) => {
                    resolve(actualBlockHeght);
                }
            ).catch(
                (error) => {
                    reject(error);
                }
            );
        });
    }

    // Add new block
    addBlock(newBlock) {
        let self = this;
        return new Promise(function(resolve, reject){
            if(newBlock){
                db.getBlocksCount().then(
                    (actualBlockHeght) => {
                        if(actualBlockHeght > 0){
                            console.log("\Current Block Height " + actualBlockHeght.toString() + "\n" );
                            // Fill the block data 
                            // Block height
                            newBlock.height = actualBlockHeght;
                            // UTC timestamp
                            newBlock.time = new Date().getTime().toString().slice(0,-3);      
                            // Block hash with SHA256 using newBlock and converting to a string

                            self.getBlock(actualBlockHeght-1).then(
                                (previousBlockJSONString) => {
                                    //console.log("prev block JSON String founded " + previousBlockJSONString);
                                    // previous block hash
                                    newBlock.previousBlockHash = 
                                    JSON.parse(previousBlockJSONString).hash;                                    
                                    newBlock.hash = '';
                                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                                    let newBlockJsonString =  JSON.stringify(newBlock).toString()
                                    //console.log("block JSON String added:\n" + newBlockJsonString.trim());
                                    db.addLevelDBData(actualBlockHeght, newBlockJsonString).then(
                                        (blockAdded) => {
                                            resolve(newBlock);
                                        }
                                    ).catch(
                                        (error) => {
                                            reject(error); 
                                        }
                                    );
                                }
                            ).catch(
                                (error) => {
                                    reject("Invalid previus block");
                                }
                            );
                        }else{
                            reject("Invalid Chain height");
                        }
                    }
                ).catch(
                    (error) => {
                        reject(error);
                    }
                );

            }else{
                reject("The new bllovk that you're traying too add in undefinded");
            }



         });

    }


    // Get Block By Height
    getBlock(selectedHeightBlock) {
        //let selectedBlock =  this.chain[selectedHeightBlock];
        return new Promise(function(resolve, reject){
            db.getLevelDBData(selectedHeightBlock).then(
                (foundedBlock) => {
                    if(foundedBlock && foundedBlock.hash != ""){
                        resolve(JSON.parse(JSON.stringify(foundedBlock)));
                    }else{
                        reject("Dude, something is wrong with the block");
                    }
                }
            ).catch(
                (err) => {
                    reject(err);
                }
            );
        });
        
              //return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(blockHeight) {
        let self =  this;
         return new Promise(function(resolve,reject){
            self.getBlock(blockHeight).then(
                (jsonStringObject) => {
                    if(jsonStringObject){
                        // get block hash
                        let jsonBlockObject = JSON.parse(jsonStringObject);
                        console.log("\nBlock to validate:");
                        console.log(jsonBlockObject);
                        let blockHash = jsonBlockObject.hash;

                        let selectedBloc = new Block.Block(jsonBlockObject.body);
                        selectedBloc.hash = '';
                        selectedBloc.height = jsonBlockObject.height;
                        selectedBloc.time = jsonBlockObject.time;
                        selectedBloc.previousBlockHash = jsonBlockObject.previousBlockHash;

                        let validBlockHash = SHA256(JSON.stringify(selectedBloc)).toString().trim();

                        console.log("\nblockHash of bloc num " + blockHeight + ": " +blockHash);
                        console.log("Re generated BlockHash of bloc number " + blockHeight + ": " +validBlockHash);

                        if(blockHash && validBlockHash ){
                            if (blockHash===validBlockHash) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }

                        }else{
                            reject("Error. Can not validate Block!!");
                        }
                    }else{
                        reject("Dude, can not found the block with you blockHeight");
                    }
                }
            ).catch(
                (error) => {
                    reject(error);
                }
            );
         });

    }

    // Validate Blockchain
    validateChain() {
        let promisesArray = [];
        let self = this;
        return new Promise(function(resolve, reject){
            self.getBlockHeight().then(
                (count) => {
                    for (var i = 0; i < count-1; i++) {
                        promisesArray.push(self.validateBlock(i));
                    }
                    if(promisesArray.length>0){
                        Promise.all(promisesArray).then(
                            (allAreValid) => {
                                resolve(allAreValid);
                            }
                        ).catch(
                            (err) => {
                                reject(err);
                            }
                        );
                    }else{
                        reject("Error: The blockchain has empty!!!");
                    }
                }
            ).catch(
                (err) => {
                    reject(err);
                }
            );       
        });

        /*

        for (var i = 0; i < this.chain.length-1; i++) {
            // validate block
            if (!this.validateBlock(i))errorLog.push(i);
            // compare blocks hash link
            let blockHash = this.chain[i].hash;
            let previousHash = this.chain[i+1].previousBlockHash;
            if (blockHash!==previousHash) {
            errorLog.push(i);
            }
        }
        if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
        } else {
            console.log('No errors detected');
        }
        */
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    hashBlock(newBLock){
        return new Promise( function (resolve, reject) {
            if(newBLock){
                let validBlockHash = SHA256(JSON.stringify(newBLock)).toString().trim();
                if(validBlockHash){
                    resolve(validBlockHash);
                }else{
                    reject("invalid block");
                }
            }else{
                reject("Null block");
            }
        });

    
    }
   
}




module.exports.Blockchain = Blockchain;