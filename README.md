# Mocha JS Reporter
> send JSON results of a karma test to a callback function

## Usage
### Install the reporter
```
npm install mocha-js-reporter
```
###Run Mocha programmatically
```js
var Mocha = require('mocha'),
    mochaReporterWrapper = require('mocha-js-reporter'),
    fs = require('fs'),
    path = require('path');

// First, you need to define a function to handle your test results
var mochaCallback = function(testResults) {
  // Do anything you like with the test results here
  console.log(testResults)
}

// Then, you need to instantiate a Mocha instance.
var mocha = new Mocha({
  // Returns a reporter that holds a callback in closure that
  // is executed on the results of the Mocha tests.
  reporter: mochaReporterWrapper(mochaCallback)
});

// Then, you need to use the method "addFile" on the mocha
// object for each file.

// Here is an example:
fs.readdirSync('some/dir').filter(function(file){
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file){
    // Use the method "addFile" to add the file to mocha
    mocha.addFile(
        path.join('some/dir', file)
    );
});

// Now, you can run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
```

## Example output
```js
[
  {
    "stats": {
      "suites": 1,
      "tests": 1,
      "passes": 1,
      "pending": 0,
      "failures": 0,
      "start": "2015-08-08T01:58:43.425Z",
      "end": "2015-08-08T01:58:43.430Z",
      "duration": 5
    },
    "tests": [
      {
        "title": "should do something",
        "fullTitle": "orms-save-user-sequelize should do something",
        "duration": 1,
        "err": {}
      }
    ],
    "pending": [],
    "failures": [],
    "passes": [
      {
        "title": "should do something",
        "fullTitle": "orms-save-user-sequelize should do something",
        "duration": 1,
        "err": {}
      }
    ]
  }
]
```
