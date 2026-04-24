const crypto = require('crypto');

class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Generates a hash for the input data.
     * @param {Array} data 
     * @returns {string}
     */
    generateKey(data) {
        const sortedData = [...data].sort().join('|');
        return crypto.createHash('sha256').update(sortedData).digest('hex');
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        // Limit cache size to 1000 entries (Production-grade memory management)
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}

module.exports = new CacheManager();
