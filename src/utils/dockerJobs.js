import { jobs } from "#services/docker";

const queryJob = async (jobId) => {
    try {
        const { data } = await jobs.getJob(jobId);

        const { status } = data;

        if (!status) throw new Error("No status found");

        return status;
    } catch (err) {
        throw new Error("Error fetching job");
    }
};

const waitForJob = (jobId, { interval = 1000, timeout = 60_000 } = {}) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const poll = async () => {
            try {
                const status = await queryJob(jobId);

                if (status.tag === "done")
                    return resolve({
                        message: status.text,
                        history: status.history,
                        createdAt: status.createdAt,
                    });
                if (status.tag === "error")
                    return resolve({
                        message: status.text,
                        history: status.history,
                        error: true,
                        createdAt: status.createdAt,
                    });

                // Check if timeout has been reached
                if (Date.now() - startTime >= timeout)
                    return reject("Timed out");

                setTimeout(poll, interval);
            } catch (err) {
                return reject(err);
            }
        };

        poll();
    });
};

export const createAndWait = async (data, type) => {
    if (type !== "docker" && type !== "clone") throw new Error("Invalid type");

    const { repo, owner } = data;
    if (!repo || !owner)
        throw new Error("Missing required fields (repo, owner)");

    let response;
    try {
        response = await jobs.create[type](
            owner,
            repo,
            type === "clone" ? data.env : null,
        );
    } catch (err) {
        console.error(err);

        throw new Error("Error creating job");
    }

    const { jobId } = response?.data;
    if (!jobId) throw new Error("Error creating job, cannot parse jobId");

    try {
        return await waitForJob(jobId);
    } catch (err) {
        //job failed
        throw err;
    }
};
