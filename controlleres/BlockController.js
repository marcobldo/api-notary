const BlockClass = require('../models/Block.js');
const BlockChain = require('../controlleres/BlockChain.js');
const APIError = require('../controlleres/APIErrorControler.js');
let myAPIError =  new APIError.APIErrorController();
let myBlockChain = new BlockChain.Blockchain();


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize all your endpoints here
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.getStarByHash();
        this.getALLStarByAddress()
    }


    getBlockByIndex() {
        this.app.get("/block/:parm", (request, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            if(request){
                if(request.params){
                    if(request.params.parm){
                        if(request.params.parm >= 0){
                            console.log("\nGet: " + (request.params.parm).toString());
                            myBlockChain.getBlockHeight().then(
                                (height) => {
                                    console.log("\ncurren Blockchain height: " + (height -1).toString());
                                    if(request.params.parm > height -1 ){
                                        res.statusCode = 404;
                                        res.send(JSON.stringify({ error: "Block not founded" }));
                                        console.log("\nBlock not founded: "+ (request.params.parm).toString());

                                    }else{           
                                        let actualHeight = request.params.parm;
                                        myBlockChain.getBlock(actualHeight).then((block) => {
                                            console.log("\nBlock requested data:\n");
                                            console.log(block);
                                            res.json(block);
                                        }).catch((err) => { 
                                            console.log(err);
                                            res.statusCode = 400;
                                            res.send(JSON.stringify({ error: err }));
                                           
                                        });
                                    }
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    res.statusCode = 400;
                                    res.send(JSON.stringify({ error: err }));
                                }
                            );
                        }else {
                            res.statusCode = 404;
                            res.send(JSON.stringify({ error: "Block not founded" }));
                        }
                    }else {
                        res.statusCode = 422;
                        res.send(JSON.stringify({ error: "Unprocessable Entity" }));
                    }
                }else {
                    res.statusCode = 422;
                    res.send(JSON.stringify({ error: "Unprocessable Entity" }));
                }
            } else {
                res.statusCode = 400;
                res.send(JSON.stringify({ error: "Bad Request" }));
            }
        });
    }


    postNewBlock() {
        this.app.post("/block", (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            let isDataRequestValid = true;
            try {            
                myAPIError.validatePOSTEnpointData(req, "postNewBlock");
            }catch (err){
                isDataRequestValid = false;
                if(err.message && err.code){
                    res.statusCode = err.code;
                    console.log(err.message);
                    res.send(JSON.stringify({ error: err.message }));
                }else{
                    res.statusCode = 500;
                    console.log("Error. postNewBlock Unexpected Error");
                    res.send(JSON.stringify({ error: "Error. postNewBlock Unexpected Error" }));
                }
            }
            if(isDataRequestValid){
                let _newBlock = new BlockClass.Block(req.body);
                myBlockChain.addBlock(_newBlock).then(
                    (_result) => {
                        res.statusCode = 200;
                        console.log("postNewBlock. Correctly added");
                        console.log(_result);
                        console.log("\n");
                        res.json(_newBlock);
                    }).catch(
                    (err) => {
                        res.statusCode = 400;
                        if(err.message){
                            res.send(JSON.stringify({ error: err.message }));
                        }else{
                            res.send(JSON.stringify({ error: err }));
                        }
                    });
            }
        });
    }

    getStarByHash() {
        this.app.get("/stars/:hash", (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            let isDataRequestValid = true;
            try {
                myAPIError.validateGETEnpointData(req, "getStarByHash");
            } catch (err) {
                isDataRequestValid = false;
                if (err.message && err.code) {
                    res.statusCode = err.code;
                    console.log(err.message);
                    res.send(JSON.stringify({ error: err.message }));
                } else {
                    res.statusCode = 500;
                    console.log("Error. getStarByHash Unexpected Error");
                    res.send(JSON.stringify({ error: "Error. getStarByHash Unexpected Error" }));
                }
            }
            if (isDataRequestValid) {
                let requestedHash = req.params.hash;
                console.log("trying to find: " + requestedHash);
                myBlockChain.findBlockByHash(requestedHash).then(
                    (_result) => {
                        res.statusCode = 200;
                        console.log("findBlockByHash. Correctly founded");
                        console.log(_result);
                        console.log("\n");
                        res.json(_result);
                    }).catch(
                    (err) => {
                        console.log(err);
                            res.statusCode = 400;
                            if (err.message) {
                                res.send(JSON.stringify({ error: err.message }));
                            } else {
                                res.send(JSON.stringify({ error: err }));
                            }
                        });
            }
        });
    }

    getALLStarByAddress() {
        this.app.get("/stars/address/:walletAddress", (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            let isDataRequestValid = true;
            try {
                myAPIError.validateGETEnpointData(req, "getALLStarByAddress");
            } catch (err) {
                isDataRequestValid = false;
                if (err.message && err.code) {
                    res.statusCode = err.code;
                    console.log(err.message);
                    res.send(JSON.stringify({ error: err.message }));
                } else {
                    res.statusCode = 500;
                    console.log("Error. getStarByHash Unexpected Error");
                    res.send(JSON.stringify({ error: "Error. getStarByHash Unexpected Error" }));
                }
            }
            if (isDataRequestValid) {
                myBlockChain.getAllBlocksByAddress(req.params.walletAddress).then(
                    (_result) => {
                        res.statusCode = 200;
                        console.log("find all stars. Correctly founded " + _result.lenght);
                        console.log("\n");
                        res.send(JSON.stringify({stars: _result }));
                    }).catch(
                        (err) => {
                            res.statusCode = 400;
                            if (err.message) {
                                res.send(JSON.stringify({ error: err.message }));
                            } else {
                                res.send(JSON.stringify({ error: err }));
                            }
                        });
            }
        });
    }

    /**
     * Helper method to initialize a Mock dataset. It adds 10 test blocks to the blocks array.
     */
    initializeMockData() {

/*
        (function theLoop (i) {
            setTimeout(function () {
                let blockTest = new BlockClass.Block("Test Block");
                myBlockChain.addBlock(blockTest).then((result) => {
                    console.log(result);
                    i++;
                    if (i < 10) theLoop(i);
                }, function(err){
                    console.log(err);
                });
            }, 0);  // set the time to generate new blocks, 0 =  immediately
          })(0);
*/
    }


}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}