/* ===== SignRequest Class ==============================
|  Class with a constructor for SignRequest model 			   |
|  ===============================================*/

class SignRequest{

	constructor(_validationRequest){
        this.validationRequest = _validationRequest,
        this.registerStar = false;
    }

}
module.exports.SignRequest = SignRequest;