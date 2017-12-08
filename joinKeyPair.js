"use strict";

var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var filePath = 'src/items.json';
var fileDest = 'dest/items.json';

var stream = fs.createReadStream(filePath, {flags: 'r', encoding: 'utf-8'});
var buf = '';

// Clear contents of file before beginning to append new objects
fs.writeFile(fileDest, '', function(){

  stream.on('data', function(d) {
      buf += d.toString(); // when data is read, stash it in a string buffer
      pump(); // then process the buffer
  });

});

function pump() {
    var pos;

    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
        if (pos === 0) { // if there's more than one newline in a row, the buffer will now start with a newline
            buf = buf.slice(1); // discard it
            continue; // so that the next iteration will start with data
        }
        processLine(buf.slice(0,pos)); // hand off the line
        buf = buf.slice(pos+1); // and slice the processed data off the buffer
    }
}

function processLine(line) { // here's where we do something with a line

    if (line[line.length-1] === '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)

    if (line.length > 0) { // ignore empty lines
        var obj = JSON.parse(line); // parse the JSON
        console.log(line)

        // Transforming single value objects into strings.
        if (typeof obj.productTitle !== 'undefined') {
          obj.productTitle = obj.productTitle[0];
        }
        if (typeof obj.productCategory !== 'undefined') {
          obj.productCategory = obj.productCategory[0];
        }
        if (typeof obj.productSubCategory !== 'undefined') {
          obj.productSubCategory = obj.productSubCategory[0];
        }
        if (typeof obj.productFullTitle !== 'undefined') {
          obj.productFullTitle = obj.productFullTitle[0];
        }
        if (typeof obj.productImage !== 'undefined') {
          obj.productImage = obj.productImage[0];
        }

        // Get the two arrays of values and combine them together into a specs key/value pair.
        if(typeof obj.specValues !== 'undefined' && typeof obj.specKeys !== 'undefined'){
            if (obj.specValues.length === obj.specKeys.length){
              _.forEach(obj.specKeys, function(value, key) {
                obj.specKeys[key] = _.camelCase(value);
              });
              obj.specs = _.zipObject(obj.specKeys, obj.specValues);
            }
        }

        // Reformat the product partNumber
        if (typeof obj.partNumber !== 'undefined') {
          obj.partNumber = obj.partNumber[0].replace('Part Number: ', '');
        }

        // Remove unecessary item
        delete obj._type;
        delete obj._cached_page_id;
        delete obj._template;
        delete obj.specKeys;
        delete obj.specValues;

        if (typeof obj.specs !== 'undefined') {
          fs.appendFileSync(fileDest, JSON.stringify(obj));
        }
    }
}
