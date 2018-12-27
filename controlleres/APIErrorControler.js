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

                    case "postNewBlock":
                    let walletAddress = req.body.address;
                    let messageSignature = req.body.star;
                    if(!walletAddress){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid walletAddress data";
                    }
                    if(!star){
                        isValid = false;
                        apiError.code = "422";
                        apiError.message = "Invalid star data";
                    }else{
                        try{
                            let jsonRequestContent = JSON.parse(contents);
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