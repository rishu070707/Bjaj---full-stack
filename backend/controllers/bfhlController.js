const GraphEngine = require('../graph-engine/GraphEngine');
const cache = require('../cache/CacheManager');
const jobQueue = require('../services/JobQueue');
const { performance } = require('perf_hooks');

exports.processBfhl = async (req, res) => {
    const startTime = performance.now();
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                error_code: "INVALID_INPUT",
                message: "Data must be an array of strings"
            });
        }

        // Cache lookup
        const cacheKey = cache.generateKey(data);
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.status(200).json(cachedResult);
        }

        // Async handling for very large datasets
        if (data.length > 500) {
            const jobId = jobQueue.enqueue(data, async (d) => {
                const engine = new GraphEngine(d);
                return compileResponse(engine, performance.now() - startTime);
            });
            return res.status(202).json({
                job_id: jobId,
                message: "Processing large graph asynchronously",
                status_url: `/bfhl/status/${jobId}`
            });
        }

        const engine = new GraphEngine(data);
        const response = compileResponse(engine, performance.now() - startTime);

        // Save to cache
        cache.set(cacheKey, response);

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: "INTERNAL_ERROR",
            message: error.message
        });
    }
};

exports.getJobStatus = (req, res) => {
    const { jobId } = req.params;
    const job = jobQueue.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
};

exports.analyzeGraph = (req, res) => {
    const { data } = req.body;
    const engine = new GraphEngine(data);
    res.json(engine.getAnalytics());
};

exports.exportGraph = (req, res) => {
    const { data, format } = req.body;
    const engine = new GraphEngine(data);
    // Simple export wrapper
    res.json({ message: "Export logic placeholder" });
};

function compileResponse(engine, executionTime) {
    const roots = engine.findRoots();
    const hierarchies = roots.map(root => {
        const res = engine.extractTree(root);
        if (res.has_cycle) {
            return { 
                root, 
                tree: {}, 
                has_cycle: true 
                // depth MUST be omitted for cyclic groups
            };
        }
        return { 
            root, 
            tree: { [root]: res.tree }, 
            depth: res.depth 
            // has_cycle MUST be omitted for non-cyclic groups
        };
    });

    const successful_trees = hierarchies.filter(h => !h.has_cycle);
    const cyclic_groups = hierarchies.filter(h => h.has_cycle);
    
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
        user_id: "aaryan_pradhan_24042026",
        email_id: "aaryan.pradhan@srm.edu",
        college_roll_number: "RA2011003010xxx",
        hierarchies,
        invalid_entries: engine.invalid_entries,
        duplicate_edges: engine.duplicate_edges,
        summary: {
            total_trees: successful_trees.length,
            total_cycles: cyclic_groups.length,
            largest_tree_root
        },
        // Analytics and meta for extended insights
        meta: {
            execution_time_ms: executionTime.toFixed(2),
            node_count: engine.nodes.size,
            version: "2.5.0-final"
        }
    };
}
