var transform = require('./transform');

var convert = {
  autoPNRIniToJSON: function (req, res, next) {

    // implementation goes here:
    var transformResult = transform.autoPNRini(req.body.ini);
    if (!transformResult.error) {
      res.send(transformResult.data);
    } else {
      transformResult.data = req.body.ini
      res.status(400).send(transformResult);
      console.log(transformResult)
    }
  }
}

module.exports = convert; 