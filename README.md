# Private Blockchain Notary Service

This is a simple local POST-GET Blockchain API for register stars using a Bitcoin Wallet.

## Getting Started

Get a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Deploy


### Prerequisites

What things you need to install the software and how to install them:

```
npm install crypto-js
```
```
npm install level
```
```
npm install string_decoder
```
```
npm install bitcoinjs-lib
```
```
npm install bitcoinjs-message
```

### Run the Project
Clone the project and running on your local machine, this project will run on port *8000*. 
Make it sure you have this port free.

For running the project, please go to the project main path and execute the next node js command:

```
npm start
```


## API Usage

### In order to posting new blocks, yo have to do the next steps:
1. First, request for wallet address validation, using the /requestValidation (POST) endpoint, then the A¨PI responses with a "message" key that you must sign using a bitcoin wallet..
2. Sign the "message" String key, using you bitcoin wallet and posting the message-signed result on the /message-signature/validate (POST) enpoint.
3. The API will verify you wallet sign and if everything is ok, you can will have the right to post new star-blocks using the /block (POST) endpoint.
4. You can request for Star-register information using the /block (GET),   /starts (GET) endpoint.


# Endpoints Usage
## 1. Request new Validation message,
Configure a POST request using URL. 
The response for the endpoint will provide a successful string response on JSON Object format. 
### Endpoint URL
```
POST http://localhost:8000/requestValidation
```
### POST arguments:
```
{ 
    "address":"19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi"
}
```
1. address [String, required] : The Wallet Address you want to register to register stars.

###  POST response:
```
POST
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 238
Connection: close
{
    "address": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
    "validationWindow": 247,
    "requestTimeStamp": "1546398534",
    "message": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi:1546398534:starRegistry"
}
```
1. address [String] : The Wallet Addres you want to register to register stars.
2. validationWindow [int] : The current value in seconds, before this request expired .
3. requestTimeStamp [int] : The request server time stamp.
4. message [String] : The string message you must sign with your bitcoin wallet in order to get access to posting new stars.


## 2. Validate message-signature.
Configure a POST request using URL. 
The response for the endpoint will provide a successful string response on JSON Object format. 
### Endpoint URL
```
POST http://localhost:8000/message-signature/validate
```
### POST arguments:
```
{
	"address":"19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
	"signature":"ILvvOjg6/vrRG7OotW6rqIeKkl8b79iLaHRYcaNIQv8xZ3XlMt5nM124GvKT8b6mn5M+d5jSHfoE/weidp82RyQ="
}
```
1. address [String, required] : The Wallet Address you want to register to register stars.
1. signature [String, required] : The result value of signing the previous "message" with you Bitcoin Wallet .
###  POST response:
```
POST
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 238
Connection: close
{
    "status": {
        "address": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
        "validationWindow": 217,
        "requestTimeStamp": "1546398534",
        "message": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi:1546398534:starRegistry",
        "messageSignature": true
    },
    "registerStar": true
}
```
1. address [String] : The Wallet Address you want to register to register stars.
2. validationWindow [int] : The current value in seconds, before this request expired .
3. requestTimeStamp [int] : The request server time stamp.
4. message [String] : The string message you must sign with your bitcoin wallet in order to get access to posting new stars.
5. messageSignature [Boolean] : TRUE, if your Sign is validated successfully.
6. registerStar [Boolean] : TRUE, if you are allowed to register stars, (The API will considerate a valid  validationWindow and messageSignature).


## 3. POST a new Star
Configure a POST request using URL. 
The response for the endpoint will provide a successful string response on JSON format.
URL
```
POST http://localhost:8000/block
```
### POST arguments:
```
{	
	"address":"19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
	"star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "this is a test!!"
            }
}
```
1. address [String, required] : The same Wallet Address you want to use for registering stars.
2. star [JSON Object, required] : The information about your new Star.
2.1 star.dec [String, required] : The information about how to find your new Star in the sky.
2.2 star.ra [String, required] : The information about how to find your new Star in the sky.
2.3 star.story [String, required] : The detailed information about how find your new Star, this record will be encoded for storage proposes.
###  POST response:
```
POST
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 238
Connection: close
{
    "hash": "5d91403320a450db9fb077591698cdd818552488b743592dee39647eb2225a9c",
    "height": 3,
    "body": {
        "address": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "74686973206973206120746573742121"
        }
    },
    "time": "1546398642",
    "previousBlockHash": "85553b09075ae61564e8963cb30c1b4561205e4c442a1bb25c894faa41bee0d8"
}
```
1. hash [String] : The unique hash start identifier.
2. height [int] : The current value height value in the Blockchain for this start.
3. body [JSON Object] : The same start information you posted abot the start.
4. time [int] : The request server time stamp.
5. previousBlockHash [String] : The unique previous hash start identifier in teh Blockchain.

## 4.GET star - block
Configure a GET request using URL path with a block height parameter. 
The response for the endpoint will provide block object on JSON format.
URL
```
GET http://localhost:8000/block/[blockheight]
```
*blockheight* hast to be an integer value. 
Example URL path:
GET http://localhost:8000/block/0
```
###  GET response:
GET
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 179
accept-ranges: bytes
Connection: close        
{
    "hash": "513d87b8f6a172ca2c8249532ec3097fa86a67eb75adb4a459cee8766473eee5",
    "height": 1,
    "body": {
        "address": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "decodedStory": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1546229389",
    "previousBlockHash": "90287a7c1346954eab1f67657d725abf2da3b53ffbaecf048c00e0dadcbc06fe"
}
```

## 5.GET start - block by Hash
Configure a GET request using URL path with a block height parameter. 
The response for the endpoint will provide block object on JSON format.
URL
```
GET http://localhost:8000/stars/[starHashValue]
```
*starHashValue* hast to be a String value. 
Example URL path:
GET http://localhost:8000/stars/5d91403320a450db9fb077591698cdd818552488b743592dee39647eb2225a9c
```
###  GET response:
GET
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 179
accept-ranges: bytes
Connection: close        
{
    "hash": "513d87b8f6a172ca2c8249532ec3097fa86a67eb75adb4a459cee8766473eee5",
    "height": 1,
    "body": {
        "address": "19zPb9NFJwnN6SDMvE8iyaXhFTw2ub6BBi",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "decodedStory": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1546229389",
    "previousBlockHash": "90287a7c1346954eab1f67657d725abf2da3b53ffbaecf048c00e0dadcbc06fe"
}
```

## 5.GET starts - blocks by Wallet Address
Configure a GET request using URL path with a block height parameter. 
The response for the endpoint will provide block object on JSON format.
URL
```
GET http://localhost:8000/stars/[registerWalletAddress]
```
*registerWalletAddress* hast to be an String value. 
Example URL path:
GET http://localhost:8000/stars/5d91403320a450db9fb077591698cdd818552488b743592dee39647eb2225a9c
```
###  GET response:
GET
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 179
accept-ranges: bytes
Connection: close        
{
    "stars": [...]
}
```
1. stars [JSONArray] : AN array of register starts, register by the wallet address previously requested.


# Error Catching
In case of sending an invalid request, the API will send you the next string response on JSON format.
```
POST / GET
HTTP/1.1 Please see Header Error Codes*
content-type: application/json; charset=utf-8
Connection: close
{"error":"Error description"}
```

# *Header Error Codes
This API has the following error codes:
400 Bad Request
404 Not Found
422 Unprocessable Entity
500 Internal Server Error


# Built With

* [express](http://expressjs.com/es/4x/api.html) - The web framework used.
* [level](https://github.com/Level) - Dependency for Block storage.
* [crypto-js](https://www.npmjs.com/package/crypto-js) - Used to generate SHA256 Hash.
* [string_decoder](https://www.npmjs.com/package/string_decoder) - Used to decode HEX messages.
* [cryptobitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) - Used to validate Bitcoin wallet address.
* [bitcoinjs-message](https://github.com/bitcoinjs/bitcoinjs-message) - Used to validate Bitcoin wallet address.

## Authors
* **Marco Moreno** - *Initial work*
