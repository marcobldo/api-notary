const apiError = new Error();


class APIErrorController {

    constructor() {
    }

    validateGETEnpointData(req, type) {
        apiError.code = "400";
        var isValid = true;
        let bodyRequest = req.params;
        if (req) {
            if (req.params) {
                switch (type) {
                    case "getStarByHash":
                        if (!bodyRequest.hash) {
                            isValid = false;
                            apiError.code = "422";
                            apiError.message = "Invalid hash data";
                        }
                        break;
                    case "getALLStarByAddress":
                        if (!bodyRequest.walletAddress) {
                            isValid = false;
                            apiError.code = "422";
                            apiError.message = "Invalid walletAddress data";
                        }
                        break;
                    default:
                        isValid = false;
                        apiError.message = "Something wrong!";
                }
            } else {
                // invalid req body
                isValid = false;
                apiError.message = "Invalid get body";
            }
        } else {
            // invalid req
            isValid = false;
            apiError.message = "Invalid req";
        }

        if (!isValid) {
            throw apiError;
        }

    }

    validatePOSTEnpointData(req, type){
        apiError.code = "400";
        var isValid = true;
        let bodyRequest = req.body;
        if(req){
            if(req.body){
                switch(type){
                    case "addRequestValidation":
                        if(!bodyRequest.address){
                            isValid = false;
                            apiError.code = "422";
                            apiError.message = "Invalid address data";
                        }
                    break;

                    case "validateMessage":
                    if(!bodyRequest.address){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid walletAddress data";
                    }
                    if(!bodyRequest.signature){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid messageSignature data";
                    }
                    break;

                    case "postNewBlock":
                    if(!bodyRequest.address){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid walletAddress data";
                    }
                    if(!bodyRequest.star){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid star data";
                    }else{
                        try{
                            let jsonRequestContent = bodyRequest.star;
                            if(jsonRequestContent){
                                if(!jsonRequestContent.dec){
                                    isValid = false;
                                    apiError.code = "422";
                                    apiError.message = "Invalid star.dec data.";
                                }
                                if(!jsonRequestContent.ra){
                                    isValid = false;
                                    apiError.code = "422";
                                    apiError.message = "Invalid star.ra data.";
                                }
                                if(!jsonRequestContent.story){
                                    isValid = false;
                                    apiError.code = "422";
                                    apiError.message = "Invalid star.story data.";
                                }
                            }else{
                                isValid = false;
                                apiError.code = "422";
                                apiError.message = "Invalid star data. Json formater";
                            }
                        }catch(err){
                            isValid = false;
                            apiError.code = "422";
                            apiError.message = err.message;
                        }
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