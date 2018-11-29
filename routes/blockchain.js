var express = require('express');
var router = express.Router();


const BlockChain = require('../controlleres/BlockChain.js');
const Block = require('../models/Block.js');

let myBlockChain = new BlockChain.Blockchain();


//Mock Data
var blocks = [];
let block_1 = {"height":"0","body":"Udacity Blockchain Developer", "time": 1538509789};
let block_2 = {"height":"1","body":"Udacity Blockchain Developer Rock!", "time": 1538509789};
blocks.push(block_1);
blocks.push(block_2);

var hashResulr; 

myBlockChain.hashBlock(block_2).then(
    (hash) => {
        hashResulr=hash;
    }
).catch(
    (error) => {
        console.error(error);
        hashResulr =  error;
    }
);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: hashResulr });
});

module.exports = router;
