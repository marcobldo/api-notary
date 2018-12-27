
const ValidatioNRequestClass = require('../models/ValidationRequest.js');
const SignRequestClass = require('../models/SignRequest.js');
const bitcoinMessage = require('bitcoinjs-message'); 
const TimeoutRequestsWindowTime = 5*60*1000;


class Mempool {
    constructor() {
        this.mempoolRequests = [];
        this.mempoolValidSigns = [];
    }

    addRequestValidation(walletAddress) {
        let _this = this;
        return new Promise (function (resolve,reject){
            if(walletAddress){
                let _newValidationRequest = new ValidatioNRequestClass.ValidationRequest(walletAddress);
                _this.findWalletInPoolTimeoutRequest(walletAddress).then(
                    (foundedValidation) => {
                        if(foundedValidation){
                            //case validation request founded
                            foundedValidation.validationWindow = _this.calculeValidationTimeLeft(foundedValidation);
                            console.log("\nTimeWindow updated!!");// your JSON
                            console.log(JSON.stringify(foundedValidation));
                            resolve(foundedValidation);
                        }else{
                            //case validation request not founded
                            console.log("\nRequest address Added!!");// your JSON
                            console.log(JSON.stringify(_newValidationRequest));
                            _this.mempoolRequests.push(_newValidationRequest);
                            _this.setRequestTimeOut(_newValidationRequest);
                            resolve(_newValidationRequest);
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
        this.mempoolRequests[validationRequest] = setTimeout(
            function() {
                self.removeValidationRequest(validationRequest) 
                }, TimeoutRequestsWindowTime );
    }

    setSignTimeOut(validSign, timeLeft){
        let self = this;
        this.mempoolValidSigns[validSign] = setTimeout(
            function() {
                self.removeValidSign(validSign) 
                }, timeLeft );
    }

    removeValidationRequest(validationRequest){
        //console.log(this.timeoutRequests);
        let index = this.mempoolRequests.indexOf(validationRequest);
        if (index >= 0) {
            console.log("\nRequest address removed!!");
            this.mempoolRequests.splice(index, 1);
        }else{
            console.log("\nRequest address not removed!!");
        }
    }

    removeValidSign(validSign){
        //console.log(this.timeoutRequests);
        let index = this.mempoolValidSigns.indexOf(validSign);
        if (index >= 0) {
            console.log("\nValid sign removed!!");
            this.mempoolValidSigns.splice(index, 1);
        }else{
            console.log("\nValid sign not removed!!");
        }
    }

    findWalletInPoolTimeoutRequest(walletAddress){
        let _this = this;
        var requestFounded = null;
                return new Promise (function (resolve,reject){
                    if(walletAddress){
                        if(_this.mempoolRequests){
                            _this.mempoolRequests.forEach(function(validationRequest) {
                                //console.log(validationRequest);
                                    if(validationRequest.address === walletAddress){
                                        requestFounded = validationRequest;
                                        return;
                                    }
                              });
                            if(!requestFounded){
                                console.log("Wallet address NOT FOUNDED  on PoolTimeoutRequest!");
                                resolve(null);
                            }else{
                                console.log("Wallet address founded!!!");
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

    findSignInPoolValidSigns(validSign){
        let _this = this;
        var validSignFounded = null;
                return new Promise (function (resolve,reject){
                    if(validSign){
                        if(_this.mempoolValidSigns){
                            _this.mempoolValidSigns.forEach(function(sign) {
                                //console.log(validationRequest);
                                    if(sign.status.address === validSign.status.address){
                                        validSignFounded = sign;
                                        return;
                                    }
                              });
                            if(!validSignFounded){
                                console.log("Wallet address NOT FOUNDED  on PoolValidSigns!");
                            }else{
                                console.log("Wallet address foundedon VALID Signs!!!");
                            }
                            //this method could return NULL...
                            resolve(validSignFounded);
                        } else {
                            console.log("Error. not foounded, invalid mempoolValidSigns[]");
                            //have to throw an error!!
                            reject("Error. not foounded, invalid mempoolValidSigns[]");
                        }
                    } else {
                        console.log("Error. not foounded, invalid sign");
                        //have to throw an error!!
                        reject("Error. not foounded, invalid sign");
                    }
                });
    }

    calculeValidationTimeLeft(_newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - _newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("\nnew TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
    }


    validateMessage(walletAddress, messageSignature) {
        let _this =  this;
        return new Promise(function (reject,resolve){
            if(walletAddress && messageSignature){
                _this.findWalletInPoolTimeoutRequest(walletAddress).then(
                    (validationRequest) => {
                        if(validationRequest){
                            let isRequestWindowTimeValid = _this.validateRequestWindowTime(validationRequest);
                            if(isRequestWindowTimeValid){
                                //time is valid
                                let newSignRequest =  new SignRequestClass.SignRequest(validationRequest);
                                console.log("ValidationRequest WindowTime is VALID");     
                                try{
                                    let isSignValid =  _this.validateMessageSignRequest(newSignRequest, messageSignature);
                                    if(isSignValid){
                                        newSignRequest.registerStar = true;
                                            newSignRequest.status.messageSignature = true;
                                            let timeSignLeft = _this.calculeValidationTimeLeft(newSignRequest.status);
                                            newSignRequest.status.validationWindow = timeSignLeft;
                                            _this.mempoolValidSigns.push(newSignRequest);
                                            _this.setSignTimeOut(newSignRequest,timeSignLeft);
                                            console.log("ValidationRequest SIGN is VALID");
                                            resolve(newSignRequest);
                                    }else{
                                        console.log("ValidationRequest SIGN is NOT VALID");
                                        reject("ValidationRequest SIGN is NOT VALID");
                                    }
                                }catch (err){
                                    console.log(err);
                                    reject(err);
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
            }else{
                console.log("Error. validateMessage has invalid parms");     
                reject("Error. validateMessage has invalid parms");
            }
        });
    }

    validateMessageSignRequest(signRequest,messageSignature){
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
    calculeValidationTimeLeft(_newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - _newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("\nnew TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
    }
}

module.exports.Mempool = Mempool;