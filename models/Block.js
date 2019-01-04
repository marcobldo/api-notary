/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(star){
     this.hash = "",
     this.height = 0,
     this.body = star,
     this.time = 0,
     this.previousBlockHash = ""
    }
}
module.exports.Block = Block;