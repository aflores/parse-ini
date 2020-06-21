'use strict';

var properties = require('../package.json')
var convert = require('../service/convert');

var controllers = {
   about: function(req, res) {
       var aboutInfo = {
           name: properties.name,
           version: properties.version
       }
       res.json(aboutInfo);
   },
   convertAutoPNR: function(req, res) {
           convert.autoPNRIniToJSON(req, res, function(err, dist) {
               if (err)
                   res.send(err);
               res.json(dist);
           });
       },
};

module.exports = controllers;