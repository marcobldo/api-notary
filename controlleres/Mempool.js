
const ValidatioNRequestClass = require('../models/ValidationRequest.js');
const SignRequestClass = require('../models/SignRequest.js');
const bitcoinMessage = require('bitcoinjs-message'); 
const TimeoutRequestsWindowTime = 5*60*1000;
const mempoolRequests = [];
const mempoolValidSigns = [];

class Mempool {
    constructor() {
        //mempoolRequests = [];
        //mempoolValidSigns = [];
    }

    removeAddresPermissions(walletAddress){
        let _this = this;
        return new Promise (function (resolve,reject){
            if(walletAddress){
                let removeValidSignPromise = new Promise (function(resolve,reject){
                    _this.findAddressInPoolValidSigns(walletAddress).then(
                        (validSign) => {
                            console.log("removeValidSignPromise CORRECTLY!");
                            _this.removeValidSign(validSign);
                            resolve(validSign);
                        }
                    ).catch(
                        (err) => {
                            console.log(err);
                            reject(err);
                        }
                    );

                });
                let removeValidationRequestPromise = new Promise (function(resolve,reject){
                    _this.findWalletInPoolTimeoutRequest(walletAddress).then(
                        (validationRequest) => {
                            console.log("removeValidationRequestPromise CORRECTLY!");
                            _this.removeValidationRequest(validationRequest);
                            resolve(validationRequest)
                        }
                    ).catch(
                        (err) => {
                            console.log(err);
                            reject(err);
                        }
                    );

                });
                Promise.all([removeValidSignPromise, removeValidationRequestPromise]).then((isAllOK) => {
                    console.log("removeAddresPermissions CORRECTLY!");
                    resolve(isAllOK);
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });
            } else {
                console.log("removeAddresPermissions Error. invalid walletAddress");
                reject("removeAddresPermissions Error. invalid walletAddress");
                //have to throw an error!!
            }
        });
    }

    addRequestValidation(walletAddress) {
        let _this = this;
        return new Promise (function (resolve,reject){
            if(walletAddress){
                let newValidationRequest = new ValidatioNRequestClass.ValidationRequest(walletAddress);
                _this.findWalletInPoolTimeoutRequest(walletAddress).then(
                    (foundedValidation) => {
                        if(foundedValidation){
                            //case validation request founded
                            foundedValidation.validationWindow = _this.calculeValidationTimeLeft(foundedValidation);
                            console.log("TimeWindow updated!!");// your JSON
                            console.log(JSON.stringify(foundedValidation));
                            console.log("\n");
                            resolve(foundedValidation);
                        }else{
                            //case validation request not founded
                            console.log("ValidationRequest added in mempoolRequests[]");// your JSON
                            console.log(newValidationRequest);
                            console.log("\n");
                            mempoolRequests.push(newValidationRequest);
                            _this.setRequestTimeOut(newValidationRequest);
                            resolve(newValidationRequest);
                        } 
                    }
                ).catch(
                    (error) => {
                        console.log(error);// your JSON
                        reject(error);
                    }
                );  
            } else {
                console.log("Error. invalid walletAddress");
                reject("Error. invalid walletAddress");
                //have to throw an error!!
            }
        });
    }

    setRequestTimeOut(validationRequest){
        let self = this;
        mempoolRequests[validationRequest] = setTimeout(
            function() {
                self.removeValidationRequest(validationRequest) 
                }, TimeoutRequestsWindowTime );
    }

    setSignTimeOut(validSign, timeLeft){
        let self = this;
        mempoolValidSigns[validSign] = setTimeout(
            function() {
                self.removeValidSign(validSign) 
            }, timeLeft*1000 );
            //it has to be *1000 cause milliseconds 
    }

    removeValidationRequest(validationRequest){
        let index = mempoolRequests.indexOf(validationRequest);
        if (index >= 0) {
            console.log("\nRequest address removed from mempoolRequests[]\n");
            mempoolRequests.splice(index, 1);
        }
    }

    removeValidSign(validSign){
        let index = mempoolValidSigns.indexOf(validSign);
        if (index >= 0) {
            mempoolValidSigns.splice(index, 1);
            console.log("\nValid sign removed from mempoolValidSigns[]\n");
        }
    }

    findWalletInPoolTimeoutRequest(walletAddress){
        let _this = this;
        var requestFounded = null;
                return new Promise (function (resolve,reject){
                    if(walletAddress){
                        if(mempoolRequests){
                            mempoolRequests.forEach(function(validationRequest) {
                                //console.log(validationRequest);
                                    if(validationRequest.address === walletAddress){
                                        requestFounded = validationRequest;
                                        return;
                                    }
                              });
                            if(!requestFounded){
                                console.log("Wallet address NOT FOUNDED  in mempoolRequests[]");
                                resolve(null);
                            }else{
                                console.log("Wallet address founded in mempoolRequests[]");
                                resolve(requestFounded);
                            }
                        } else {
                            console.log("Error. not foounded, invalid mempoolRequests[]");
                            //have to throw an error!!
                            reject("Error. not foounded, invalid mempoolRequests[]");
                        }
                    } else {
                        console.log("Error. not foounded, invalid walletAddress");
                        //have to throw an error!!
                        reject("Error. not foounded, invalid walletAddress");
                    }
                });
    }

    findAddressInPoolValidSigns(walletAddress){
        let _this = this;
        var validSignFounded = null;
                return new Promise (function (resolve,reject){
                    if(walletAddress){
                        if(mempoolValidSigns){
                            mempoolValidSigns.forEach(function(sign) {
                                //console.log(validationRequest);
                                    if(sign.status.address === walletAddress){
                                        validSignFounded = sign;
                                        return;
                                    }
                              });
                            if(!validSignFounded){
                                console.log("walletAddress NOT FOUNDED  in mempoolValidSigns[]!");
                            }else{
                                console.log("walletAddress FOUNDED in mempoolValidSigns[]");
                            }
                            //this method could return NULL...
                            resolve(validSignFounded);
                        } else {
                            console.log("Error. walletAddress NOT FOUNDED, invalid mempoolValidSigns[]");
                            //have to throw an error!!
                            reject("Error. walletAddress NOT FOUNDED, invalid mempoolValidSigns[]");
                        }
                    } else {
                        console.log("Error. walletAddress NOT FOUNDED, invalid walletAddress");
                        //have to throw an error!!
                        reject("Error. walletAddress NOT FOUNDED, invalid walletAddress");
                    }
                });
    }

    calculeValidationTimeLeft(newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("new TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
    }


    validateMessage(walletAddress, messageSignature) {
        let _this =  this;
        return new Promise(function (resolve,reject){
            if(walletAddress && messageSignature){
                //first, find validSign in signPool
                _this.findAddressInPoolValidSigns(walletAddress).then(
                    (signMessageRequest) => {
                        if(signMessageRequest){
                            //just updating the time window
                            let timeSignLeft = _this.calculeValidationTimeLeft(signMessageRequest.status);
                            signMessageRequest.status.validationWindow = timeSignLeft;  
                            var isSignValid = false;
                            try {
                                isSignValid =  _this.validateMessageSignRequest(signMessageRequest, messageSignature);
                            } catch (err) {
                                console.log(err);     
                                reject(err.message);
                            }
                            if(isSignValid){
                                console.log("signMessageRequest has a valid sign");     
                                signMessageRequest.status.messageSignature = true;
                            }else{
                                console.log("signMessageRequest has an invalid sign");     
                                signMessageRequest.status.messageSignature = false;
                            }
                            console.log("resolving findAddressInPoolValidSigns");     
                            resolve(signMessageRequest);
                        }else{
                            console.log("signMessageRequest is null,looking in mempoolRequests[] ");     

                            // we cant find a signMessage, maybe it's expired, let's try  with  _this.findWalletInPoolTimeoutRequest
                            _this.findWalletInPoolTimeoutRequest(walletAddress).then(
                                (validationRequest) => {
                                    if(validationRequest){
                                        let isRequestWindowTimeValid = _this.validateRequestWindowTime(validationRequest);
                                        if(isRequestWindowTimeValid){
                                            //time is valid
                                            let newSignRequest =  new SignRequestClass.SignRequest(validationRequest);
                                            console.log("validationRequest WindowTime is VALID");     
                                            var isSignValid = false;
                                            try {
                                                isSignValid =  _this.validateMessageSignRequest(newSignRequest, messageSignature);
                                            } catch (err) {
                                                console.log(err);     
                                                reject(err.message);
                                            }
                                            if(isSignValid){
                                                newSignRequest.registerStar = true;
                                                newSignRequest.status.messageSignature = true;
                                                let timeSignLeft = _this.calculeValidationTimeLeft(newSignRequest.status);
                                                newSignRequest.status.validationWindow = timeSignLeft;
                                                mempoolValidSigns.push(newSignRequest);
                                                _this.setSignTimeOut(newSignRequest,timeSignLeft);
                                                console.log("pushing newSignRequest on mempoolValidSigns[]");     
                                                console.log(newSignRequest);
                                                console.log("\n");
                                                resolve(newSignRequest);
                                            }else{
                                                console.log("signMessageRequest has an invalid sign");     
                                                reject("newSignRequest.messageSignature is NOT VALID");
                                            }
                                        }else{
                                            //expired time reached
                                            console.log("Error. Validation request has expired");
                                            reject("Error. Validation request has expired");
                                        } 
                                    } else {
                                        console.log("Error, invalid validationRequest");     
                                        reject("Error, invalid validationRequest");
                                    }
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    reject(err);
                                });
                        }
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        reject(err);  
                    }
                );

            }else{
                console.log("Error. validateMessage has invalid parms");     
                reject("Error. validateMessage has invalid parms");
            }
        });
    }

    validateMessageSignRequest(signRequest,messageSignature){
        console.log("Validating sign");     
        let message = signRequest.status.message;
        let address = signRequest.status.address;
        return bitcoinMessage.verify(message, address, messageSignature);
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
    calculeValidationTimeLeft(newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("new TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
    }

    verifyWalletAddress(walletAddress){
        console.log("Verifying walletAddres...");
        let _this = this;
        return new Promise(function(resolve,reject){
            if(walletAddress){
                _this.findAddressInPoolValidSigns(walletAddress).then(
                    (signFounded) => {
                        if(signFounded){
                            if(signFounded.registerStar){
                                console.log(walletAddress+" can register stars");
                                resolve(true);
                            }else{
                                console.log("signFounded.registerStar=FALSE. walletAddres can NOT register stars");
                                resolve(false);
                            }
                        }else{
                            console.log(walletAddress+" NOT FOUNDED. walletAddres can NOT register stars");
                            resolve(false);
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
                console.log("Error verifying walletAddres, Invalid walletAddress");
                reject("Error verifying walletAddres, Invalid walletAddress");
            }
        });
    }


}

module.exports.Mempool = Mempool;