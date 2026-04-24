/**
 * Processes the edge data and builds hierarchical trees or detects cycles.
 * @param {string[]} data - Array of strings in format "X->Y"
 * @returns {Object} - Result containing hierarchies, invalid_entries, duplicate_edges, and summary.
 */
function processEdges(data) {
    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];
    const seen_edges = new Set();
    const children_with_parents = new Set();

    // 1. Validation and Duplicate Filtering
    data.forEach(entry => {
        const trimmed = entry.trim();
        // Regex: Single letter -> Single letter, must be different nodes
        const match = trimmed.match(/^([A-Z])->([A-Z])$/);
        
        if (!match) {
            invalid_entries.push(trimmed);
            return;
        }

        const [_, parent, child] = match;
        
        // A->A is invalid (self-loop is a cycle/invalid)
        if (parent === child) {
            invalid_entries.push(trimmed);
            return;
        }

        if (seen_edges.has(trimmed)) {
            if (!duplicate_edges.includes(trimmed)) {
                duplicate_edges.push(trimmed);
            }
            return;
        }

        // Multi-parent check: If child already has a parent, discard later silently
        if (children_with_parents.has(child)) {
            // "Keep first occurrence only, Discard later silently"
            return;
        }

        seen_edges.add(trimmed);
        valid_edges.push({ parent, child });
        children_with_parents.add(child);
    });

    // 2. Build Adjacency List
    const adj = {};
    const nodes = new Set();
    valid_edges.forEach(({ parent, child }) => {
        if (!adj[parent]) adj[parent] = [];
        adj[parent].push(child);
        nodes.add(parent);
        nodes.add(child);
    });

    // 3. Find Roots (Nodes with no parent)
    const roots = Array.from(nodes).filter(node => !children_with_parents.has(node)).sort();

    const hierarchies = [];
    let total_cycles = 0;

    // Helper: Build Tree Structure and Detect Cycles
    function buildTree(node, visited = new Set()) {
        if (visited.has(node)) {
            return { has_cycle: true };
        }
        visited.add(node);
        
        const children = adj[node] || [];
        const treeObj = {};
        let maxDepth = 1;
        let cycleDetected = false;

        for (const child of children) {
            const result = buildTree(child, new Set(visited));
            if (result.has_cycle) {
                cycleDetected = true;
                break;
            }
            treeObj[child] = result.tree;
            maxDepth = Math.max(maxDepth, 1 + result.depth);
        }

        if (cycleDetected) return { has_cycle: true };
        
        return { 
            tree: treeObj, 
            depth: maxDepth 
        };
    }

    // 4. Process each root to identify trees or cycles
    roots.forEach(root => {
        const result = buildTree(root);
        if (result.has_cycle) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            hierarchies.push({
                root,
                tree: { [root]: result.tree },
                depth: result.depth
            });
        }
    });

    // 5. Summary
    const successful_trees = hierarchies.filter(h => !h.has_cycle);
    let largest_tree_root = "";
    if (successful_trees.length > 0) {
        // Sort by depth descending, then lexicographical root ascending
        successful_trees.sort((a, b) => {
            if (b.depth !== a.depth) return b.depth - a.depth;
            return a.root.localeCompare(b.root);
        });
        largest_tree_root = successful_trees[0].root;
    }

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: successful_trees.length,
            total_cycles: total_cycles,
            largest_tree_root
        }
    };
}

module.exports = { processEdges };
