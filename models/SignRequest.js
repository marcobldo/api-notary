/* ===== SignRequest Class ==============================
|  Class with a constructor for SignRequest model 			   |
|  ===============================================*/

class SignRequest{

	constructor(_validationRequest){
        this.status = _validationRequest,
        this.status.messageSignature = false;
        this.registerStar = false;
    }

}
module.exports.SignRequest = SignRequest;