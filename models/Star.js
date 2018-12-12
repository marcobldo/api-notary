/* ===== Start Model Class ==============================
|  Class with a constructor for Start 			   |
|  ===============================================*/

class Star{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.message = data,
     this.requestTimeStamp = 0,
     this.previousBlockHash = "",
     this.validationWindow = 0,
     this.walletAddress = ""
    }
}
module.exports.Star = Star;