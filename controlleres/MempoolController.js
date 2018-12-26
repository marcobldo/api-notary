const Mempool = require('../controlleres/Mempool.js'); 
const APIError = require('../controlleres/APIErrorControler.js');
let myMempool = new Mempool.Mempool();
let myAPIError =  new APIError.APIErrorController();

class MempoolController {
/**
* Constructor to create a new MempoolController, you need to initialize all your endpoints here
* @param {*} app 
*/
    constructor(app) {
        this.app = app;
        this.addRequestValidation();
        this.validateMessage();

        //this.setTimeOut();
    }


    validateMessage() {
        this.app.post("/message-signature/validate", (req, res) => {
            // Add your code here
            res.setHeader('Content-Type', 'application/json');
            try{
                myAPIError.validatePOSTEnpointData(req, "validateMessage");
                let walletAddress = req.body.address;
                let messageSignature = req.body.signature;
                myMempool.validateMessage(walletAddress, messageSignature).then(
                    (validationRequest) => {
                        if(validationRequest){
                            res.statusCode = 200;
                            res.json(newSignRequest);
                        }else{
                            res.statusCode = 400;
                            res.send(JSON.stringify({ error: "validateMessage" }));
                        }
                    }
                    ).catch (
                    (err) => {
                        res.statusCode = 400;
                        res.send(JSON.stringify({ error: err }));
                    });
            }catch (err){
                if(err.message && err.code){
                    res.statusCode = err.code;
                    console.log(err.message);
                    res.send(JSON.stringify({ error: err.message }));
                }else{
                    res.statusCode = 500;
                    console.log("Error. validateMessage Unexpected Error");
                    res.send(JSON.stringify({ error: "Error. validateMessage Unexpected Error" }));
                }
            }
        })
    }


    addRequestValidation() {
        this.app.post("/requestValidation", (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            try{
                myAPIError.validatePOSTEnpointData(req, "addRequestValidation");
                let walletAddress = req.body.address;
                myMempool.addRequestValidation(walletAddress).then(
                    (validationRequest) => {
                        res.json(validationRequest);
                    }
                    ).catch (
                    (err) => {
                        res.statusCode = 400;
                        res.send(JSON.stringify({ error: err }));
                    });
            }catch (err){
                res.statusCode = err.code;
                console.log(err.message);
                res.send(JSON.stringify({ error: err.message }));
            }
        });
    }

}

/**
 * Exporting the MempoolController class
 * @param {*} app 
 */
module.exports = (app) => { return new MempoolController(app);}