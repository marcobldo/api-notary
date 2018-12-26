
const ValidatioNRequestClass = require('../models/ValidationRequest.js');
const SignRequestClass = require('../models/SignRequest.js');
const bitcoinMessage = require('bitcoinjs-message'); 
const TimeoutRequestsWindowTime = 5*60*1000;


class Mempool {
    constructor() {
        //this.chain = new LevelSandbox.LevelSandbox();
        this.mempoolRequests = [];
        this.initMempool();
    }

    addRequestValidation(walletAddress) {
        let _this = this;
        return new Promise (function (resolve,reject){
            if(walletAddress){
                let _newValidationRequest = new ValidatioNRequestClass.ValidationRequest(walletAddress);
                _this.findWalletInPoolTimeoutRequest().then(
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

    /**This method could return NULL */
    findWalletInPoolTimeoutRequest(walletAddress){
        var requestFounded = null;
                return new Promise (function (resolve,reject){
                    if(walletAddress){
                        if(this.mempoolRequests){
                            this.mempoolRequests.forEach(function(validationRequest) {
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
                            console.log("Error. invalid mempoolRequests[]");
                            //have to throw an error!!
                            reject("Error. invalid mempoolRequests[]");
                        }
                    } else {
                        console.log("Error. invalid walletAddress");
                        //have to throw an error!!
                        reject("Error. invalid walletAddress");
                    }
                });
    }

    calculeValidationTimeLeft(_newValidationRequest){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - _newValidationRequest.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        console.log("\nnew TimeWindow: "+timeLeft);// your JSON
        return  timeLeft;
    }


}

module.exports.Mempool = Mempool;