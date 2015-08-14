/**
 * Expose `JSON`.
 */

module.exports = {
  reporter: JSONReporter,
  wrapper: JSONReporterWrapper
}

/**
 * Return a new `JSON` reporter that executes a callback on the
 * test's results.
 *
 * @api public
 * @param {Function} callback that accepts json results
 * @returns {Reporter}
 */

function JSONReporterWrapper(done) {
  JSONReporter.$onComplete = done;
  return JSONReporter;
}

/**
 * `JSON` reporter that executes a callback on the
 * test's results.
 *
 * Inject a callback into it by assigning a function to JSONReporter.$onComplete
 *
 * @api public
 * @returns {Reporter}
 */


// Should be invoked with itself as context to look for $onComplete property correctly
function JSONReporter(runner) {
  var stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 };
  var tests = [];
  var pending = [];
  var failures = [];
  var passes = [];

  runner.on('start', function() {
    stats.start = new Date();
  });

  runner.on('suite', function(suite) {
    suite.root || stats.suites++;
  });

  runner.on('test end', function(test) {
    stats.tests++;
    tests.push(test);
  });

  runner.on('pass', function(test) {
    if (test.duration > test.slow()) {
      test.speed = 'slow';
    } else if (test.duration > test.slow() / 2) {
      test.speed = 'medium';
    } else {
      test.speed = 'fast';
    }

    stats.passes++;
    passes.push(test);
  });

  runner.on('fail', function(test, err) {
    stats.failures++;
    test.err = err;
    failures.push(test);
  });

  runner.on('pending', function(test) {
    stats.pending++;
    pending.push(test);
  });

  runner.on('end', function() {
    stats.end = new Date();
    stats.duration = new Date() - stats.start;

    var obj = {
      stats: stats,
      tests: tests.map(format),
      pending: pending.map(format),
      failures: failures.map(format),
      passes: passes.map(format)
    };

    JSONReporter.$onComplete(obj);
  });
}

// Default callback
JSONReporter.$onComplete = function(output){
  process.stdout.write(JSON.stringify(output, null, 2));
};

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @api private
 * @param {Object} test
 * @return {Object}
 */
function format(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    err: errorJSON(test.err || {}),
    code: clean(test.fn.toString())
  };
}

/**
 * Trim the given `str`.
 *
 * @api private
 * @param {string} str
 * @return {string}
 */
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Strip the function definition from `str`, and re-indent for pre whitespace.
 *
 * @param {string} str
 * @return {string}
 */
function clean(str) {
  str = str
    .replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '')
    .replace(/^function *\(.*\)\s*{|\(.*\) *=> *{?/, '')
    .replace(/\s+\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length;
  var tabs = str.match(/^\n?(\t*)/)[1].length;
  var re = new RegExp('^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');

  str = str.replace(re, '');

  return trim(str);
};

/**
 * Transform `error` into a JSON object.
 *
 * @api private
 * @param {Error} err
 * @return {Object}
 */
function errorJSON(err) {
  return Object.getOwnPropertyNames(err)
    .reduce(function(output, key) {
      // Remove any key whose value cannot be stringified
      try {
        JSON.stringify(err[key]);
      } catch(e) {
        if (e.message === 'Converting circular structure to JSON')
          return output;
      }
      // Value is not circular, add it to our output
      output[key] = err[key];
      return output;
    }, {});
}
