(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['Mocha'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but only
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('Mocha'));
  } else {
    // Browser globals (root is window)
    root.MochaJSReporter = factory(root.Mocha);
  }
}(this, function(Mocha) {

  /**
   * Return a new `JSON` reporter that holds a callback in closure
   * and executes it on the reporter's test results.
   *
   * @api public
   * @param {Function} callback that accepts json results
   * @returns {Reporter}
   */

  function MochaJSReporter(done) {
    done = done || prettyPrintToStdout;

    return function(runner) {
      MochaJSReporter.Base.call(this, runner);
      runner.on('end', function() {
        done(runner.testResults); // Mocha is done, here's your results!
      })
    }
  }

  /**
   * Expose a static base `JSON` reporter
   * that doesn't do anything with final results.
   *
   * @api public
   */

  MochaJSReporter.Base = function(runner) {
    Mocha.reporters.Base.call(this, runner);

    var self = this;
    var tests = [];
    var pending = [];
    var failures = [];
    var passes = [];

    runner.on('test end', function(test) {
      tests.push(test);
    });

    runner.on('pass', function(test) {
      passes.push(test);
    });

    runner.on('fail', function(test) {
      failures.push(test);
    });

    runner.on('pending', function(test) {
      pending.push(test);
    });

    runner.on('end', function() {
      var obj = {
        stats: self.stats,
        tests: tests.map(formatTest),
        pending: pending.map(formatTest),
        failures: failures.map(formatTest),
        passes: passes.map(formatTest)
      };

      runner.testResults = obj;
    });
  }

  return MochaJSReporter;

  // Private functions below

  /**
   * Return a plain-object representation of `test`
   * free of cyclic properties etc.
   *
   * @api private
   * @param {Object} test
   * @return {Object}
   */
  function formatTest(test) {
    return {
      title: test.title,
      fullTitle: test.fullTitle(),
      duration: test.duration,
      err: errorJSON(test.err || {}),
      code: Mocha.utils.clean(test.fn.toString())
    };
  }

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

  /**
   * Pretty print any object to process.stdout
   *
   * @api private
   * @param {Object}
   */
  function prettyPrintToStdout(results) {
    process.stdout.write(JSON.stringify(results, null, 2));
  }
}));
