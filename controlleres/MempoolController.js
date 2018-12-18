const ValidatioNRequestClass = require('../models/ValidationRequest.js');
const SignRequestClass = require('../models/SignRequest.js');
const bitcoinMessage = require('bitcoinjs-message'); 
const TimeoutRequestsWindowTime = 5*60*1000;
//const TimeoutRequestsWindowTime = 10000;


class MempoolController {
/**
* Constructor to create a new MempoolController, you need to initialize all your endpoints here
* @param {*} app 
*/
    constructor(app) {
        this.app = app;
        this.mempool = [];
        this.timeoutRequests = [];
        this.addRequestValidation();
        this.validateMessage();

        //this.setTimeOut();
    }


    validateMessage() {
        this.app.post("/message-signature/validate", (req, res) => {
            // Add your code here
            res.setHeader('Content-Type', 'application/json');
            if(req){
                if(req.body){
                    console.log(req.body);// your JSON
                    if(req.body.address && req.body.signature){
                        let walletAddress = req.body.address;
                        let messageSignature = req.body.signature;
                        let validationRequest = this.findWalletInPoolTimeoutRequest(walletAddress);
                        console.log(JSON.stringify(validationRequest));
                        if(validationRequest){
                            let signRequest =  new SignRequestClass.SignRequest(validationRequest);
                            let isSignValid =  this.validateMessageSignRequest(signRequest, messageSignature);
                            if(isSignValid){
                                signRequest.registerStar = true;
                                console.log("ValidationRequest is VALID");

                                try{
                                    this.removeValidationRequestOfTimeoutRequests(validationRequest);
                                }catch (err){
                                    res.statusCode = 400;
                                    console.log("Error. " + err);
                                    res.send(JSON.stringify({ error: err }));                                }
                            }else{
                                console.log("ValidationRequest is NOT VALID");

                            }
                            res.json(signRequest);
                        }else{
                            res.statusCode = 404;
                            console.log("Error. validation request not founded in ValidationRequestPool");
                            res.send(JSON.stringify({ error: "Validation request not founded in ValidationRequestPool" }));
                        }
                        
                    } else if(!req.body.address){
                        res.statusCode = 422;
                        console.log("Error. address invalid param");
                        res.send(JSON.stringify({ error: "invalid params" }));
                    } else if(!req.body.signature){
                        res.statusCode = 422;
                        console.log("Error. signature invalid param");
                        res.send(JSON.stringify({ error: "invalid params" }));
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


    //it should be a promise!!!
    validateMessageSignRequest(signRequest,messageSignature){
        let message = signRequest.validationRequest.message;
        let address = signRequest.validationRequest.address;
        return bitcoinMessage.verify(message, address, messageSignature);
    }

    removeValidationRequestOfTimeoutRequests(validationRequest){
        if(validationRequest){
            
        }else{
            console.log("INVALID validationRequest");
            throw new Error("INVALID validationRequest");
        }
    }

    findWalletInPoolTimeoutRequest(walletAddress){
        var requestFounded = null;
        if(walletAddress){
            if(this.timeoutRequests){
                this.timeoutRequests.forEach(function(validationRequest) {
                    //console.log(validationRequest);
                        if(validationRequest.address === walletAddress){
                            requestFounded = validationRequest;
                            return;
                        }
                  });
            }
        }
        if(!requestFounded){
            console.log("Wallet address NOT FOUNDED  on PoolTimeoutRequest!");
        }else{
            console.log("Wallet address founded!!!");
        }
        return requestFounded;
    }

    addRequestValidation() {
        this.app.post("/requestValidation", (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if(req){
                if(req.body){
                    console.log(req.body);// your JSON
                    if(req.body.address){
                        let walletAddress = req.body.address;
                        let _newValidationRequest = new ValidatioNRequestClass.ValidationRequest(walletAddress);
                        console.log(JSON.stringify(_newValidationRequest));
                        this.timeoutRequests.push(_newValidationRequest);
                        console.log("\nRequest address Added!!");// your JSON
                        this.setRequestTimeOut(walletAddress);
                        res.json(_newValidationRequest);
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

    setRequestTimeOut(walletAddress){
        let self = this;
        this.timeoutRequests[walletAddress] = setTimeout(
            function() {
                self.removeValidationRequest(walletAddress) 
                 console.log("\nRequest address removed!!");
                }, TimeoutRequestsWindowTime );
    }

    removeValidationRequest(walletAddress){
        let index = this.timeoutRequests.indexOf(walletAddress);
        if (index > -1) {
            this.timeoutRequests.splice(index, 1);
        }
    }



}

/**
 * Exporting the MempoolController class
 * @param {*} app 
 */
module.exports = (app) => { return new MempoolController(app);}