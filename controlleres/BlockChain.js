/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const Block = require('../models/Block.js');
const Star = require('../models/Star.js');
const LevelSandboxClass = require('../controlleres/LevelSandbox.js');
const Mempool = require('../controlleres/Mempool.js');
const db = new LevelSandboxClass.LevelSandbox();
 

class Blockchain {

    constructor() {
        this.chain;
        this.mempool;
        this.initBlockchain();
    }

    initBlockchain(){
        this.chain = [];
        this.mempool = new Mempool.Mempool();
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
            newBlock.body = new Star.Star("0x","Genesis Star - Block");
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

    getAllBlocksByAddress(walletAddress) {
        console.log("\nFinding getAllBlocksByAddress by walletAddress");
        return new Promise(function (resolve, reject) {
            db.getAllBlocksByAddress(walletAddress).then(
                (blockResult) => {
                    if (blockResult) {
                        resolve(blockResult);
                    } else {
                        reject("starts not founded");
                    }
                }
            ).catch(
                (err) => {
                    reject(err);
                });

        });
    }

    findBlockByHash(requestedHash) {
        console.log("\nFinding new block by hash");
        return new Promise(function (resolve, reject) {
            db.findBlockByHash(requestedHash).then(
                (blockResult) => {
                    if (blockResult) {
                        resolve(blockResult);
                    } else {
                        reject("Block not founded");
                    }
                }
            ).catch(
                (err) => {
                    console.log(err);
                    reject(err);
                });

        });
    }

    // Add new block
    addBlock(newBlock) {
        let self = this;
        console.log("\n");
        console.log(this.mempool);
        console.log("\n");

        return new Promise(function(resolve, reject){
            if(newBlock){
                self.mempool.verifyWalletAddress(newBlock.body.address).then(
                    (isvalid) => {
                        if (isvalid) {
                            if (newBlock.body.star.story) {
                                console.log("Encouding start story to hex");
                                let encoudedStory = Buffer.from((newBlock.body.star.story), 'utf8').toString('hex');
                                newBlock.body.star.story = encoudedStory; 
                                console.log(newBlock);
                                console.log("\n Enter in add block method");
                                let _self = self;
                                db.getBlocksCount().then(
                                    (actualBlockHeght) => {
                                        /*
                                        REVIEW COMMENT>
                                        actualBlockHeight will give you the height of the last block in the chain,
                                         by subtracting one you are getting the second last block, 
                                         this is why your previous hash is invalid, you must use the last block instead.
                                         RESPONSE>
                                         In this poject, the Blockchain Genesis Block has the height value = 0, when I call getBlocksCount(); returns 1,
                                         That mens I have to use actualBlockHeght-1 to get a previousBlockHash value, then use it in my new Block that i want to add.
                                        */
                                        if(actualBlockHeght > 0){
                                            console.log("\Current Block Height " + actualBlockHeght.toString() + "\n" );
                                            newBlock.height = actualBlockHeght;
                                            newBlock.time = new Date().getTime().toString().slice(0,-3);      
                                            //I used "actualBlockHeght-1" because I have to find "previousBlockHash" and adding in this block to ensure the blockchain linking
                                            //You have using an older version (in review #3) of the project,
                                            //I know that because the next part doesn´t exists in the review comments, I'll check this comment to be shure this is the fianal version (04/01/2019)
                                            _self.getBlock(actualBlockHeght-1).then(
                                                (previousBlockJSONString) => {
                                                    if(previousBlockJSONString){
                                                        newBlock.previousBlockHash = previousBlockJSONString.hash;                                    
                                                        newBlock.hash = '';
                                                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                                                        let newBlockJsonString =  JSON.stringify(newBlock).toString()
                                                        db.addLevelDBData(actualBlockHeght, newBlockJsonString).then(
                                                            (blockAdded) => {
                                                                if(blockAdded){
                                                                    /*
                                                                    REVIEW COMMENT>
                                                                    After the block is added successfully, you have to remove the permission to add further blocks for that address because a user is 
                                                                    only permitted to add a single star after validation. Afterward, the user has to restart the validation process.
                                                                    RESPONSE>
                                                                    Totally agree.
                                                                    */
                                                                   self.mempool.removeAddresPermissions(newBlock.body.address).then(
                                                                    (isRemoveSuuccsess) => {
                                                                        if(isRemoveSuuccsess){
                                                                            console.log("Permissions removed successfully!");
                                                                            resolve(newBlock);
                                                                        }else{
                                                                            console.log("Remove wallet permissionsUnexpected Error");
                                                                            reject("Remove wallet permissionsUnexpected Error");
                                                                        }
                                                                    }
                                                                    ).catch(
                                                                        (err)=> {
                                                                            console.log(err);
                                                                            reject(err);
                                                                        }
                                                                    );


                                                                }else{
                                                                    reject("The block you trying to add is null or invalid");
                                                                }
                                                            }
                                                        ).catch(
                                                            (error) => {
                                                                reject(error); 
                                                            }
                                                        );
                                                    } else {
                                                        reject("Invalid previus block");
                                                    }
                                                }
                                            ).catch(
                                                (error) => {
                                                    console.log(error);
                                                    reject(err);
                                                }
                                            );
                                        }else{
                                            reject("Invalid Chain height");
                                        }
                                    }
                                ).catch(
                                    (error) => {
                                        console.log("\n Enter in add block method");
                                        reject(error);
                                    }
                                );
                            }
                        }else{
                            reject("Your sign has expired. Please, sign your wallet addres to continue.");
                        }
                    }
                ).catch(
                    (err) => {
                        if(err.message){
                            reject(err.message);
                        }else{
                            reject(err);
                        }
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
                        resolve(foundedBlock);
                    }else{
                        reject("Dude, something is wrong with the block");
                    }
                }
            ).catch(
                (err) => {
                    console.log(err);
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