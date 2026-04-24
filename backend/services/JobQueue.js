const { randomUUID } = require('crypto');

class JobQueue {
    constructor() {
        this.jobs = new Map();
    }

    /**
     * Enqueue a new graph processing job.
     */
    enqueue(data, processor) {
        const jobId = randomUUID();
        this.jobs.set(jobId, {
            status: 'processing',
            progress: 0,
            result: null,
            created_at: new Date()
        });

        // Simulate async processing
        setTimeout(async () => {
            try {
                const result = await processor(data);
                this.jobs.set(jobId, {
                    ...this.jobs.get(jobId),
                    status: 'completed',
                    progress: 100,
                    result
                });
            } catch (err) {
                this.jobs.set(jobId, {
                    ...this.jobs.get(jobId),
                    status: 'failed',
                    error: err.message
                });
            }
        }, 500);

        return jobId;
    }

    getJob(jobId) {
        return this.jobs.get(jobId);
    }
}

module.exports = new JobQueue();
