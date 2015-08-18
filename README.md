# Mocha JS Reporter
> send JSON results of a karma test to a callback function

## Usage
### Install the reporter
```
npm install mocha-js-reporter
```

### Run Mocha programmatically
```js
var fs = require('fs'),
    path = require('path'),
    Mocha = require('mocha'),
    MochaJSReporter = require('mocha-js-reporter')(Mocha);

// First, you need to define a function to handle your test results
var mochaCallback = function(testResults) {
  // Do anything you like with the test results here
  // ..
}

// Then, you need to instantiate a Mocha instance.
var mocha = new Mocha({
  // Returns a reporter that holds a callback in closure that
  // is executed on the results of the Mocha tests.
  reporter: new MochaJSReporter(mochaCallback)
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
Note: `mochaCallback` will write JSON to `process.stdout` if not explicitly defined

## Example output
```js
{
  "stats": {
    "suites": 1,
    "tests": 2,
    "passes": 1,
    "pending": 0,
    "failures": 1,
    "start": "2015-08-08T17:15:28.232Z",
    "end": "2015-08-08T17:15:28.237Z",
    "duration": 5
  },
  "tests": [
    {
      "title": "should do something",
      "fullTitle": "orms-save-user-sequelize should do something",
      "duration": 2,
      "err": {},
      "code": "Object.keys(sequelize.models).length.should.equal(2);"
    },
    {
      "title": "should fail",
      "fullTitle": "orms-save-user-sequelize should fail",
      "duration": 1,
      "err": {
        "operator": "to be",
        "expected": 4,
        "message": "expected 3 to be 4",
        "showDiff": true,
        "actual": 3,
        "negate": false,
        "stack": "AssertionError: expected 3 to be 4\n    at Context.<anonymous> (sample-solution-code/problems/orms-save-user-sequelize/orms-save-user-sequelize.test.js:14:16)",
        "_message": "expected 3 to be 4",
        "generatedMessage": true
      },
      "code": "// something\n// some other comment\nvar myVar = 4;\n\n(3).should.equal(4);"
    }
  ],
  "pending": [],
  "failures": [
    {
      "title": "should fail",
      "fullTitle": "orms-save-user-sequelize should fail",
      "duration": 1,
      "err": {
        "operator": "to be",
        "expected": 4,
        "message": "expected 3 to be 4",
        "showDiff": true,
        "actual": 3,
        "negate": false,
        "stack": "AssertionError: expected 3 to be 4\n    at Context.<anonymous> (sample-solution-code/problems/orms-save-user-sequelize/orms-save-user-sequelize.test.js:14:16)",
        "_message": "expected 3 to be 4",
        "generatedMessage": true
      },
      "code": "// something\n// some other comment\nvar myVar = 4;\n\n(3).should.equal(4);"
    }
  ],
  "passes": [
    {
      "title": "should do something",
      "fullTitle": "orms-save-user-sequelize should do something",
      "duration": 2,
      "err": {},
      "code": "Object.keys(sequelize.models).length.should.equal(2);"
    }
  ]
}
```
