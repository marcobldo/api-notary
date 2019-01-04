/* ===== Start Model Class ==============================
|  Class with a constructor for Start 			   |
|  ===============================================*/

class Star{
	constructor(address, _story){
        this.star = {
            dec : "",
            ra : "",
            story : _story
        },
        this.address = address
    }
}
module.exports.Star = Star;