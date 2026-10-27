import "server-only";
import { execFileSync } from "node:child_process";

export type Revision = { letter: string; hash: string; date: string; subject: string };

/** A, B, …, Z, AA, AB, … as on a drawing's revision block. */
export function revLetter(n: number) {
  let s = "";
  for (let k = n; k > 0; k = Math.floor((k - 1) / 26)) s = String.fromCharCode(65 + ((k - 1) % 26)) + s;
  return s;
}

const tidy = (subject: string) => {
  const s = subject.replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * The revision block, compiled at build time from the git history of this directory: the latest
 * `limit` commits, lettered in order from the first. Empty when git is unavailable.
 */
export function getRevisions(limit = 6): Revision[] {
  const git = (...args: string[]) => execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    const total = Number(git("rev-list", "--count", "HEAD", "--", "."));
    const lines = git("log", `-n${limit}`, "--date=short", "--format=%h%x1f%ad%x1f%s", "--", ".").split("\n").filter(Boolean);
    return lines.map((l, i) => {
      const [hash, date, subject] = l.split("\x1f");
      return { letter: revLetter(total - i), hash, date, subject: tidy(subject) };
    });
  } catch {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA;
    const msg = process.env.VERCEL_GIT_COMMIT_MESSAGE;
    return sha && msg ? [{ letter: "–", hash: sha.slice(0, 7), date: new Date().toISOString().slice(0, 10), subject: tidy(msg.split("\n")[0]) }] : [];
  }
}
