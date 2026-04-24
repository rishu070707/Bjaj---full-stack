const GraphEngine = require('../graph-engine/GraphEngine');

const testData = ["A->B", "B->C", "C->A"]; // Cycle
const engine = new GraphEngine(testData);

console.log("--- Cycle Test ---");
console.log("Has Cycle:", engine.hasCycle("A"));
console.log("Analytics:", JSON.stringify(engine.getAnalytics(), null, 2));

const treeData = ["A->B", "A->C", "B->D"];
const treeEngine = new GraphEngine(treeData);
console.log("\n--- Tree Test ---");
console.log("Analytics:", JSON.stringify(treeEngine.getAnalytics(), null, 2));
console.log("Export Adjacency:", treeEngine.export('adjacency_list'));
