/**
 * 
 * 
 * 
 * 
 */

var _ = require('lodash');

/**
 * Main entry point
 */
fn_autoPNRini = function (iniText) {
  var outputJson = {
    _remarks: [],
    initial: [],
    final: [],
    user: {}
  };

  var outputError = null;

  // ini line types
  const TYPE_SECTION = 0;
  const TYPE_REMARK = 1;
  const TYPE_KVSEQ = 2;
  const TYPE_KV = 3;
  const TYPE_UNKNOWN = 4;

  // -- [keyNames], function to assemble(node)


  // -- helpers
  const parseIniLine = function (line, lineNumber) {

    var retVal = { type: TYPE_UNKNOWN, data: [line], lineNumber: lineNumber }

    const rgx = {
      section: /^\[.*\]$/,                      // [whatever]
      remark: /^\'.*$/,                         // ' blah
      kVSeq: /^(\D*)(\d+)\s*\=\s*(.+)$/,       // (key)(##)=(value)
      kv: /^(\S+)\s*\=\s*(.+)$/                // (key)=(value)
    }

    var kvSeqMatch = line.match(rgx.kVSeq);
    var kvMatch = line.match(rgx.kv);

    if (rgx.section.test(line)) {
      retVal.type = TYPE_SECTION;
      retVal.data = ['section', line];
    } else if (rgx.remark.test(line)) {
      retVal.type = TYPE_REMARK;
      retVal.data = ['remark', line.substring(1)];
    } else if (kvSeqMatch && kvSeqMatch.length === 4) {
      retVal.type = TYPE_KVSEQ;
      retVal.data = [kvSeqMatch[1], kvSeqMatch[2], kvSeqMatch[3]];
    } else if (kvMatch && kvMatch.length === 3) {
      retVal.type = TYPE_KV;
      retVal.data = [kvMatch[1], kvMatch[2]];
    }

    return retVal;
  }


  const fn_objAdd = function (node, stmt) {
    var elem = stmt.data[0]
    var value = stmt.data[1]

    if (stmt.data[0] === 'user') {
      elem = stmt.data[0] + stmt.data[1]
      value = stmt.data[2]
    }

    node[elem] = value;
  }

  const fn_arrayPush = function (node, stmt) {
    var value = ''
    if (stmt.type === TYPE_REMARK) {
      value = stmt.data[1].substring(1)
    } else if (stmt.type === TYPE_KV) {
      value = stmt.data[1]
    } else if (stmt.type === TYPE_KVSEQ) {
      value = stmt.data[1]
    }
    node.push(value);
  }

  const fn_noRule = function (node, stmt) {
    console.log("There is no rule for: ", stmt)
  }

  const fn_doNothing = function (node, stmt) {
    console.log("Disregaring: ", stmt)
  }

  // - rules
  const composerRules = {
    // 
    "remark": { fn: fn_arrayPush, node: outputJson._remarks },
    "init": { fn: fn_arrayPush, node: outputJson.initial },
    "final": { fn: fn_arrayPush, node: outputJson.final },
    "section": { fn: fn_doNothing, node: null },
    "user": { fn: fn_objAdd, node: outputJson.user },
    "default": { fn: fn_objAdd, node: outputJson },
    "noRule": { fn: fn_noRule, node: null },
    // -- 
    "keya": { fn: fn_objAdd, node: outputJson },
    "key1aa": { fn: fn_objAdd, node: outputJson },
  }

  const evaluate = function (stmt) {
    var rule = composerRules[stmt.data[0]] || composerRules["noRule"]
    rule.fn(rule.node, stmt)
  }


  // -- end helpers

  var iniLines = iniText.split(/\r\n|\r|\n/);

  // console.log(iniLines)
  var lineNumber = 0;

  _.forEach(iniLines, function (rawLine) {

    lineNumber += 1;

    var line = _.trim(rawLine)
    if (line.length === 0) return;

    var stmt = parseIniLine(line, lineNumber);
    evaluate(stmt);

    // switch (stmt.type) {
    //   case TYPE_SECTION:
    //     break;
    //   case TYPE_REMARK:
    //     fn_arrayPush(outputJson._remarks, stmt.data[0])
    //     break;
    //   case TYPE_KV:
    //     //console.log('kv ',stmt.type,stmt.data);
    //     outputJson[stmt.data[0]] = stmt.data[1];
    //     break;
    //   case TYPE_KVSEQ:
    //     //console.log('kvs',stmt.type,stmt.data);
    //     outputJson.initial.push(stmt.data[2])
    //     break;
    //   default:
    //     outputError = "Cannot process line " + lineNumber + " : '" + stmt.data[0] + "'"
    // }

  });

  return { error: outputError, data: outputJson }
}


// -- exports
var transform = {
  autoPNRini: fn_autoPNRini
}

module.exports = transform; 