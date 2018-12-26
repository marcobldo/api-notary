const apiError = new Error();


class APIErrorController {

    constructor() {
    }

    validatePOSTEnpointData(req, type){
        apiError.code = "400";
        var isValid = true;
        if(req){
            if(req.body){
                switch(type){
                    case "addRequestValidation":
                        let address = req.body.address;
                        if(!address){
                            isValid = false;
                            apiError.code = "422";
                            apiError.message = "Invalid address data";
                        }
                    break;

                    case "validateMessage":
                    let walletAddress = req.body.address;
                    let messageSignature = req.body.signature;
                    if(!walletAddress){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid walletAddress data";
                    }
                    if(!messageSignature){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid messageSignature data";
                    }
                    break;

                    default:
                    isValid = false;
                    apiError.message = "Something wrong!";
                }
            } else {
                // invalid req body
                isValid = false;
                apiError.message = "Invalid req body";
            }
        } else {
            // invalid req
            isValid = false;
            apiError.message = "Invalid req";
        }

        if(!isValid){
            throw apiError;
        }

    }

}

module.exports.APIErrorController = APIErrorController;