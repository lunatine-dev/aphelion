import axios from "axios";

let baseUrl;

export const jobs = {
    init(port) {
        baseUrl = `http://host.docker.internal:${port}`;
    },
    ping() {
        return axios.get(`${baseUrl}/ping`);
    },
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
    getContainer(repo_id) {
        return axios.get(`${baseUrl}/docker/containers/github/${repo_id}`);
    },
};
