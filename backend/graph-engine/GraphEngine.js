const crypto = require('crypto');

/**
 * Advanced Graph Engine optimized for the SRM Challenge requirements.
 */
class GraphEngine {
    constructor(edges = []) {
        this.rawEdges = edges;
        this.adj = new Map();
        this.inDegree = new Map(); // child -> parent
        this.nodes = new Set();
        
        this.invalid_entries = [];
        this.duplicate_edges = [];
        this.seenEdges = new Set();
        
        this._buildGraph(edges);
    }

    _buildGraph(edges) {
        edges.forEach(edge => {
            const trimmed = edge.trim();
            // RULE: X->Y where X and Y are single uppercase letters (A-Z)
            const match = trimmed.match(/^([A-Z])->([A-Z])$/);
            
            if (!match) {
                this.invalid_entries.push(trimmed);
                return;
            }

            const [_, parent, child] = match;

            // RULE: Self-loop A->A is invalid
            if (parent === child) {
                this.invalid_entries.push(trimmed);
                return;
            }

            const edgeKey = `${parent}->${child}`;

            // RULE: Duplicate edges
            if (this.seenEdges.has(edgeKey)) {
                if (!this.duplicate_edges.includes(edgeKey)) {
                    this.duplicate_edges.push(edgeKey);
                }
                return;
            }

            // RULE: Multi-parent case (First-encountered wins, others silently discarded)
            if (this.inDegree.has(child)) {
                this.seenEdges.add(edgeKey); // Mark as seen so it's not "invalid" but we discard it for building
                return;
            }

            this.seenEdges.add(edgeKey);
            if (!this.adj.has(parent)) this.adj.set(parent, []);
            if (!this.adj.has(child)) this.adj.set(child, []);
            
            this.adj.get(parent).push(child);
            this.inDegree.set(child, parent);
            this.nodes.add(parent);
            this.nodes.add(child);
        });
    }

    findRoots() {
        // True roots: no incoming edges
        const trueRoots = Array.from(this.nodes).filter(node => !this.inDegree.has(node));
        
        // Pure cycles: groups where every node has an in-degree
        // We find these by seeing which nodes are not reachable from true roots
        const visited = new Set();
        const traverse = (node) => {
            if (visited.has(node)) return;
            visited.add(node);
            (this.adj.get(node) || []).forEach(child => traverse(child));
        };
        trueRoots.forEach(root => traverse(root));

        const unvisited = Array.from(this.nodes).filter(node => !visited.has(node)).sort();
        const cycleRoots = [];
        
        while (unvisited.length > 0) {
            const cycleRoot = unvisited[0];
            cycleRoots.push(cycleRoot);
            
            // Mark all nodes in this cycle/component as visited
            const componentVisited = new Set();
            const traverseComponent = (node) => {
                if (componentVisited.has(node)) return;
                componentVisited.add(node);
                // Also remove from the "unvisited" global list
                const idx = unvisited.indexOf(node);
                if (idx > -1) unvisited.splice(idx, 1);
                
                (this.adj.get(node) || []).forEach(child => traverseComponent(child));
                // In a cycle, we might need to check incoming as well to clear the whole component
                // but since it's a "group", DFS from one node usually covers it in a pure cycle.
            };
            traverseComponent(cycleRoot);
        }

        return [...trueRoots, ...cycleRoots].sort();
    }

    hasCycle(startNode) {
        const visited = new Set();
        const recStack = new Set();

        const check = (node) => {
            visited.add(node);
            recStack.add(node);

            for (const neighbor of (this.adj.get(node) || [])) {
                if (recStack.has(neighbor)) return true;
                if (!visited.has(neighbor)) {
                    if (check(neighbor)) return true;
                }
            }

            recStack.delete(node);
            return false;
        };

        return check(startNode);
    }

    extractTree(node, visitedInComponent = new Set()) {
        if (visitedInComponent.has(node)) return { has_cycle: true };
        visitedInComponent.add(node);

        const tree = {};
        let maxDepth = 1;
        let cycle = false;

        const children = this.adj.get(node) || [];
        for (const child of children) {
            const sub = this.extractTree(child, new Set(visitedInComponent));
            if (sub.has_cycle) {
                cycle = true;
                break;
            }
            tree[child] = sub.tree;
            maxDepth = Math.max(maxDepth, 1 + sub.depth);
        }

        if (cycle) return { has_cycle: true };
        return { tree, depth: maxDepth };
    }

    getAnalytics() {
        const v = this.nodes.size;
        const e = this.seenEdges.size;
        return {
            node_count: v,
            edge_count: e,
            is_dag: Array.from(this.nodes).every(n => !this.hasCycle(n))
        };
    }
}

module.exports = GraphEngine;
