// Edges are links between Tracks

var tv4 = require('tv4');

var Edge = {};

var fromTriple = Edge.fromTriple = function (edgeTriple) {
  edgeTriple = edgeTriple || {};

  return {
    in: edgeTriple.subject,
    edgeId: edgeTriple.predicate,
    out: edgeTriple.object,
    endIn: edgeTriple.endIn,
    startEdge: edgeTriple.startEdge,
    endEdge: edgeTriple.endEdge,
    startOut: edgeTriple.startOut,
  };
}

var schema = Edge.schema = {
  "type": "object",
  "properties": {
    "in": {
      "description": "id of track in to edge",
      "type": "string",
    },
    "edgeId": {
      "description": "id of edge track",
      "type": "string",
    },
    "out": {
      "description": "id of track out of edge",
      "type": "string"
    },
    "endIn": {
      "description": "end seconds of track in",
      "type": "number",
    },
    "startEdge": {
      "description": "start seconds of edge track",
      "type": "number",
    },
    "endEdge": {
      "description": "end seconds of edge track",
      "type": "number",
    },
    "startOut": {
      "description": "start seconds of track out",
      "type": "number",
    },
  },
  "required": ["in", "out", "edgeId", "endIn", "startEdge", "endEdge", "startOut"],
};

var validation = Edge.validation = function (edge) {
  return tv4.validateMultiple(edge, schema, true);
};

module.exports = Edge;