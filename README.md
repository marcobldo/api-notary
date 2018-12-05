# Simple Blockchain API

This is a simple local POST-GET Blockchain API for testing proposes.

## Getting Started

hese instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Deploy


### Prerequisites

What things you need to install the software and how to install them:

```
npm install crypto-js
```
```
npm install level
```

### Run the Project
Clone the project and running on your local machine, this project will run on port *8000*. 
Make it sure you have this port free.

For running the project, please go to the project main path and execute the next node js command:

```
npm start
```



## API Usage

This API has the following petitions:

GET Block Endpoint.
POST Block Endpoint.

## Endpoints Usage

### GET Block
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
GET
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 179
accept-ranges: bytes
Connection: close        
{
    result : {"hash":"49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3","height":0,"body":"First block in the chain - Genesis block","time":"1530311457","previousBlockHash":""}
}  
```


### POST Block
Configure a POST request using URL. 
The response for the endpoint will provide a successful string response on JSON format.

URL
```
POST http://localhost:8000/block
```

```
POST
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 238
Connection: close
{"result":"Block added!"}
```

## Error Catching
In case of sending an ivalid request, the API will send you the next string response on JSON format.
```
POST / GET
HTTP/1.1 Please see Header Error Codes*
content-type: application/json; charset=utf-8
Connection: close
{"error":"Error description"}
```

### *Header Error Codes
This API has the following error codes:
400 Bad Request
404 Not Found
422 Unprocessable Entity
500 Internal Server Error


## Built With

* [express](http://expressjs.com/es/4x/api.html) - The web framework used.
* [level](https://github.com/Level) - Dependency for Block storage.
* [crypto-js](https://www.npmjs.com/package/crypto-js) - Used to generate SHA256 Hash.

## Authors
* **Marco Moreno** - *Initial work* 
