const BlockClass = require('../models/Block.js');
const BlockChain = require('../controlleres/BlockChain.js');
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
                                            res.send(JSON.stringify({ result: JSON.parse(block) }));
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

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            // Add your code here
            res.setHeader('Content-Type', 'application/json');
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
                                res.send(JSON.stringify({ result : _newBlock }));                    
                            }
                        ).catch(
                            (err) => {
                                res.statusCode = 400;
                                console.log("Error. " + err);
                                res.send(JSON.stringify({ error: err }));
                            }
                        );
                    } else {
                        res.statusCode = 422;
                        console.log("Error. invalid params");
                        res.send(JSON.stringify({ error: "invalid params" }));
                    }
                } else {
                    res.statusCode = 422;
                    console.log("Error. invalid NULL params");
                    res.send(JSON.stringify({ error: "invalid NULL params" }));
                }
            } else {
                res.statusCode = 400;
                console.log("Error. invalid request");
                res.send(JSON.stringify({ error: "Invalid request" }));
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