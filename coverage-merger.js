var jsonMerger = require('json-merger');
var fse = require('fs-extra');
var result = jsonMerger.mergeFiles(['./tempfolder/1.json', './tempfolder/2.json', './tempfolder/3.json']);
fse.outputJsonSync('./out.json', result);
