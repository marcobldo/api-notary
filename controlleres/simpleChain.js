/* ===== Executable Test ==================================
|  Use this file to test your project.
|  =========================================================*/

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

let myBlockChain = new BlockChain.Blockchain();


/******************************************
 ** Function for Create Tests Blocks   ****
 ******************************************/

(function theLoop (i) {
	setTimeout(function () {
		let blockTest = new Block.Block("Test Block");
		// Be careful this only will work if your method 'addBlock' in the Blockchain.js file return a Promise
		myBlockChain.addBlock(blockTest).then((result) => {
			console.log(result);
			i++;
			if (i < 10) theLoop(i);
		}, function(err){
			console.log(err);
		});
	}, 1000);  // set the time to generate new blocks, 0 =  immediately
  })(0);



/***********************************************
 ** Function to get the Height of the Chain ****
 ***********************************************
// Be careful this only will work if `getBlockHeight` method in Blockchain.js file return a Promise
setTimeout(function () {
	myBlockChain.getBlockHeight().then((result) => {
		console.log("\nFinal Blockchain height: " + result);
	}).catch((err) => { console.log(err);});
}, 4000);



/***********************************************
 ******** Function to Get a Block  *************
 ***********************************************
setTimeout(function () {
	myBlockChain.getBlockHeight().then((actualHeight) => {
		myBlockChain.getBlock(actualHeight-1).then((block) => {
			console.log("\nFinal Blockchain block data: " + JSON.stringify(block));
		}).catch((err) => { console.log(err);});
	}).catch((err) => { console.log(err);});
}, 5000);


/***********************************************
 ***************** Validate Block  *************
 ***********************************************
// Be careful this only will work if `validateBlock` method in Blockchain.js file return a Promise
setTimeout(function () {
	myBlockChain.getBlockHeight().then((blockHeight) => {
		console.log("\n\nStarting validation of the last element in the Blockchain: ");
		console.log(blockHeight-1);

		myBlockChain.validateBlock(blockHeight-1).then((valid) => {
			console.log("Is a valid block? : " + valid.toString());
		}).catch((error) => {
			console.log(error);
		});

	}).catch((err) => { console.log(err);});

}, 6000);


/***********************************************
 ***************** Validate Chain  *************
 ***********************************************
// Be careful this only will work if `validateChain` method in Blockchain.js file return a Promise
setTimeout(function () {
	console.log("\n\nSTARTING VALIDATE CHAIN DEBUG PROCESS!!!!!!");
}, 7000);

setTimeout(function () {
	myBlockChain.validateChain().then((validChain) => {
		if(validChain){
			console.log("\n\nCorrect Chain!!!!!!!!!");
		}else{
			console.log("\n\ninvalid Chain :(");
		}
	}).catch((error) => {
		console.log(error);
	})
}, 10000);

