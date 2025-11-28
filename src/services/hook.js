import path from "path";
import fs from "fs/promises";
import { Repo } from "#models/github/Repo";
import { RepoCloneLog } from "#models/github/RepoCloneLog";
import { RepoDockerLog } from "#models/github/RepoDockerLog";
import { fileExists, folderExists } from "#utils/filesystem";
import { createAndWait } from "#utils/dockerJobs";

const ALLOWED_EVENTS = ["push"];
const PING_EVENT = "ping";
const HEADER_EVENT = "x-github-event";

const getEnvForRepo = async (repoId, localRepoDir) => {
    const repo = await Repo.findOne({ id: repoId });
    if (repo?.env && repo.env.trim() !== "") return repo.env.trim();

    const envPath = path.join(localRepoDir, ".env");
    // do checks in parallel
    const [dirExists, envFileExists] = await Promise.all([
        folderExists(localRepoDir),
        fileExists(envPath),
    ]);

    if (!dirExists || !envFileExists) return "";

    const raw = await fs.readFile(envPath, "utf8");
    const env = raw.replace(/\r\n/g, "\n").trim();
    if (env.length === 0) return "";
    if (env.length > 200_000) throw new Error("env too large");

    return env;
};

const appendLog = async (id, type, status, history = []) => {
    let dbFunc =
        type === "clone"
            ? RepoCloneLog
            : type === "docker"
            ? RepoDockerLog
            : null;
    if (!dbFunc) throw new Error("Invalid type");

    history = Array.isArray(history) ? history : [];

    await dbFunc.updateOne(
        {
            repoId: id,
        },
        {
            $set: { status },
            $setOnInsert: { repoId: id, history: [] },
            $push: { logs: { $each: history } },
        },
        {
            upsert: true,
        }
    );
};

export default async (req, res) => {
    if (!process.env.GITHUB_SAVE_DIR)
        return res.status(500).send({ message: "Invalid configuration" });

    const event = req.headers[HEADER_EVENT];

    if (!event)
        return res.status(400).send({ message: "Missing GitHub event header" });

    if (event === PING_EVENT) return res.send({ message: "Pong!" });

    if (!ALLOWED_EVENTS.includes(event))
        return res.status(400).send({ message: "Invalid event" });

    if (!req.body || !req.body.repository || !req.body.ref) {
        return res
            .status(400)
            .send({ message: "Missing repository or ref in body" });
    }

    const { repository, hook, sender } = req.body;
    const { default_branch } = repository;
    const branch = req.body.ref.split("/").pop();

    if (branch !== default_branch)
        return res.send({ message: "Must be default branch" });

    try {
        const localRepoDir = path.join(
            process.env.GITHUB_SAVE_DIR,
            repository.id.toString()
        );
        const env = await getEnvForRepo(repository.id, localRepoDir);

        const [owner, repo] = repository.full_name.split("/");

        // Initiate a clone job (this is a smart job, it will pull if it already exists or clone if new)
        const cloneJobResponse = await createAndWait(
            { owner, repo, env },
            "clone"
        );
        // job will only resolve if it's successful or errored, so let's now run the docker job
        const dockerJobResponse = await createAndWait(
            { owner, repo },
            "docker"
        );

        // Both are successful,  {job}.history contains log history, so let's import this log history to our database so the frontend can see the status.
        //TODO
        try {
            await appendLog(
                repository.id,
                "clone",
                cloneJobResponse.error ? "error" : "success",
                cloneJobResponse.history
            );
            await appendLog(
                repository.id,
                "docker",
                dockerJobResponse.error ? "error" : "success",
                dockerJobResponse.history
            );
        } catch (err) {
            console.error(
                `Failed to append logs for repo ${repository.id}:`,
                err
            );
        }

        // Let's also let GitHub know we're done.
        return res.json({
            message: "Webhook complete",
            clone: cloneJobResponse.message,
            docker: dockerJobResponse.message,
        });
    } catch (err) {
        console.error(
            "Webhook error for repo",
            repository?.id,
            err?.message ?? err
        );

        return res.status(500).send({ message: "Internal server error" });
    }
};
