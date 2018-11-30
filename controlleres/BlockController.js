const BlockClass = require('../models/Block.js');
const BlockChain = require('../controlleres/BlockChain.js');
let myBlockChain = new BlockChain.Blockchain();
// Creating the levelSandbox class object
const LevelSandboxClass = require('./LevelSandbox.js');

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
        this.blocks = new LevelSandboxClass.LevelSandbox();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/api/block/:index", (request, res) => {
            res.setHeader('Content-Type', 'application/json');
            if(request){
                if(request.params){
                    if(request.params.index){
                        if(request.params.index >= 0){
                            myBlockChain.getBlockHeight().then(
                                (height) => {
                                    console.log("\ncurren Blockchain height: " + (height -1).toString());
                                    if(request.params.index > height -1 ){
                                        res.send(JSON.stringify({ error: "Block not founded" }));
                                        console.log("\nBlock not founded: "+ (request.params.index).toString());

                                    }else{           
                                        let actualHeight = request.params.index;
                                        myBlockChain.getBlock(actualHeight).then((block) => {
                                            console.log("\nBlock requested data:\n");
                                            console.log(block);
                                            res.send(JSON.stringify({ result: block }));
                                        }).catch((err) => { 
                                            console.log(err);
                                            res.send(JSON.stringify({ error: err }));
                                        });
                                    }
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    res.send(JSON.stringify({ error: err }));
                                }
                            );
                        }else {
                            res.send(JSON.stringify({ error: "Block not founded" }));
                        }
                    }else {
                        res.send(JSON.stringify({ error: "Invalid GET params" }));
                    }
                }else {
                    res.send(JSON.stringify({ error: "Invalid GET params" }));
                }
            } else {
                res.send(JSON.stringify({ error: "Invalid GET request" }));
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/api/block", (req, res) => {
            // Add your code here
            if(req){
                console.log(req.body);// your JSON
                if(req.body){
                    if(req.body.body){
                        console.log("Posting you block");// your JSON
                        let _newBlock = new BlockClass.Block(req.body.body);
                        console.log(JSON.stringify(_newBlock));
                        myBlockChain.addBlock(_newBlock).then(
                            (_result) => {
                                console.log("Correctly added");
                                console.log(_result);
                                res.send(JSON.stringify({ result: "Correctly added" }));
                            }
                        ).catch(
                            (err) => {
                                res.send(JSON.stringify({ error: err }));
                            }
                        );
                    } else {
                        res.send(JSON.stringify({ error: "invalid params" }));
                    }
                } else {
                    res.send(JSON.stringify({ error: "invalid NULL params" }));
                }
            } else {
                res.send(JSON.stringify({ error: "Invalid request" }));
            }
        });
    }

    /**
     * Helper method to initialize a Mock dataset. It adds 10 test blocks to the blocks array.
     */
    initializeMockData() {
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
    }


}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}