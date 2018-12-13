/* ===== ValidationRequest Class ==============================
|  Class with a constructor for ValidationRequest manager 			   |
|  ===============================================*/
const TimeoutRequestsWindowTime = 5*60*1000;


class ValidationRequest{

	constructor(address){
     this.walletAddress = address,
     this.validationWindow = 0,
     this.requestTimeStamp = 0, 
     this.message = "",
     this.initalizateValidationRequest(address)
    }

    initalizateValidationRequest(address){
        this.requestTimeStamp = this.generateRequestTimeStamp(); 
        this.message = this.generateMessage(address);
        this.validationWindow = this.validationWindowTimer(this.requestTimeStamp);
    }

    generateRequestTimeStamp(){
       return new Date().getTime().toString().slice(0,-3);
    }
    
    generateMessage(walletAddress){
        //Message format = [walletAddress]:[timeStamp]:starRegistry
        if(walletAddress){
            return walletAddress+":"+this.requestTimeStamp+"starRegistry";
        }
    }

    validationWindowTimer(){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - this.requestTimeStamp;
        return (TimeoutRequestsWindowTime/1000) - timeElapse;  //time left
    }

}
module.exports.ValidationRequest = ValidationRequest;