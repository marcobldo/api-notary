const ValidatioNRequestClass = require('../models/ValidationRequest.js');
const SignRequestClass = require('../models/SignRequest.js');
const bitcoinMessage = require('bitcoinjs-message'); 
const Mempool = require('../controlleres/Mempool.js'); 
const APIError = require('../controlleres/APIErrorControler.js');

const TimeoutRequestsWindowTime = 5*60*1000;
let myMempool = new Mempool.Mempool();
let myAPIError =  new APIError.APIErrorController();

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
                            let isRequestWindowTimeValid = this.validateRequestWindowTime(validationRequest);
                            if(isRequestWindowTimeValid){
                                                                //time is valid
                                let newSignRequest =  new SignRequestClass.SignRequest(validationRequest);
                                console.log("ValidationRequest WindowTime is VALID");     
                                try{
                                    let isSignValid =  this.validateMessageSignRequest(newSignRequest, messageSignature);
                                    if(isSignValid){
                                        newSignRequest.registerStar = true;
                                            newSignRequest.status.messageSignature = true;
                                            newSignRequest.status.validationWindow = this.calculeValidationTimeLeft(newSignRequest.status);
                                            console.log("ValidationRequest SIGN is VALID");
                                            //check if signRequest exist in mempool!!!
                                            res.json(newSignRequest);
                                    }else{
                                        console.log("ValidationRequest SIGN is NOT VALID");
                                    }
                                }catch (err){
                                    res.statusCode = 400;
                                    console.log("Error. " + err);
                                    res.send(JSON.stringify({ error: err }));                                
                                }
                            }else{
                                //expired time reached
                                res.statusCode = 404;
                                console.log("Error. Validation request has expired");
                                res.send(JSON.stringify({ error: "Validation request has expired" }));
                            }
                            
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


    validateRequestWindowTime(validationRequest){
        let isValid = true;
        if(validationRequest){
            if(validationRequest.validationWindow < 1){
                isValid = false;
            }
        }else{
            isValid = false;
        }

        return isValid;
    }


    //it should be a promise!!!
    validateMessageSignRequest(signRequest,messageSignature){
        let message = signRequest.status.message;
        let address = signRequest.status.address;
        return bitcoinMessage.verify(message, address, messageSignature);
    }

    sendValidationRequestToMempool(signRequest){
        if(signRequest){
            this.mempool.push(signRequest);
            this.setSignRequestTimeOut(signRequest);
            this.removeValidationRequest(signRequest.status)
        }else{
            console.log("INVALID validationRequest");
            throw new Error("INVALID validationRequest");
        }
    }

    findSignRerquestOnMempool(walletAddress){
        var signRequestFounded = null;
        if(walletAddress){
            if(this.mempool){
                let _this = this;
                this.mempool.forEach(function(signRequest) {
                    //console.log(validationRequest);
                        if(signRequest.status.address === walletAddress){
                            signRequestFounded = signRequest;
                            return;
                        }
                  });
            }
        }
        if(!signRequestFounded){
            console.log("Wallet address NOT FOUNDED  on MermPool!");
        }else{
            console.log("Wallet address founded on MermPool!!!");
        }
        return signRequestFounded;
    }

    findWalletInPoolTimeoutRequest(walletAddress){
        var requestFounded = null;
        if(walletAddress){
            if(this.timeoutRequests){
                let _this = this;
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

    calculeValidationTimeLeft(_newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - _newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("\nnew TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
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

    setRequestTimeOut(validationRequest){
        let self = this;
        this.timeoutRequests[validationRequest] = setTimeout(
            function() {
                self.removeValidationRequest(validationRequest) 
                }, TimeoutRequestsWindowTime );
    }

    removeValidationRequest(validationRequest){
        //console.log(this.timeoutRequests);
        let index = this.timeoutRequests.indexOf(validationRequest);
        if (index >= 0) {
            console.log("\nRequest address removed!!");
            this.timeoutRequests.splice(index, 1);
        }else{
            console.log("\nRequest address not removed!!");
        }
    }


    setSignRequestTimeOut(signRequest){
        let self = this;
        this.mempool[signRequest] = setTimeout(
            function() {
                self.removeValidationRequest(signRequest) 
                }, TimeoutRequestsWindowTime );
    }

    removesignRequestMempool(signRequest){
        let index = this.mempool.indexOf(signRequest);
        if (index > -1) {
            console.log("\nSignRequest address removed!!");
            this.timeoutRequests.splice(index, 1);
        }
    }



}

/**
 * Exporting the MempoolController class
 * @param {*} app 
 */
module.exports = (app) => { return new MempoolController(app);}