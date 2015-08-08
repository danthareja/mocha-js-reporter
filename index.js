/**
 * Expose `JSON`.
 */

module.exports = function(Mocha) {

  /**
   * Return a new `JSON` reporter that executes a callback on the
   * test's results.
   *
   * @api public
   * @param {Function} callback that accepts json results
   * @returns {Reporter}
   */
  return function JSONReporterWrapper(callback) {
    return function JSONReporter(runner) {
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
          tests: tests.map(clean),
          pending: pending.map(clean),
          failures: failures.map(clean),
          passes: passes.map(clean)
        };

        runner.testResults = obj;
        callback(obj);
      });
    }
  }

  /**
   * Return a plain-object representation of `test`
   * free of cyclic properties etc.
   *
   * @api private
   * @param {Object} test
   * @return {Object}
   */
  function clean(test) {
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
};
