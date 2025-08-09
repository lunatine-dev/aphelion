import axios from "axios";

const baseUrl = `http://127.0.0.1:${process.env.DOCKER_API_PORT}`;

export const jobs = {
    getJobs() {
        return axios.get(`${baseUrl}/jobs`);
    },

    getJob(jobId) {
        return axios.get(`${baseUrl}/jobs/${jobId}`);
    },

    create: {
        clone(owner, repo, env = "") {
            return axios.post(`${baseUrl}/jobs/create`, {
                owner,
                repo,
                env,
                type: "clone",
            });
        },

        docker(owner, repo) {
            return axios.post(`${baseUrl}/jobs/create`, {
                owner,
                repo,
                type: "docker",
            });
        },
    },
};

export const docker = {
    getContainers() {
        return axios.get(`${baseUrl}/docker/containers`);
    },
};
