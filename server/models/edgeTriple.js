// EdgeTriples are Edges with
// 'in' -> 'subject'
// 'edgeId' -> 'predicate'
// 'out' -> 'object'
// as used by levelgraph

var EdgeTriple = {};

EdgeTriple.fromEdge = function (edge) {
  edge = edge || {};

  return {
    subject: edge.in,
    predicate: edge.edgeId,
    object: edge.out,
    endIn: edge.endIn,
    startEdge: edge.startEdge,
    endEdge: edge.endEdge,
    startOut: edge.startOut,
  };
};

module.exports = EdgeTriple;