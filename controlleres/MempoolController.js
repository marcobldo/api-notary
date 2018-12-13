const ValidatioNRequestClass = require('../models/ValidationRequest.js');
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
        //this.validateMessage();

        //this.setTimeOut();
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