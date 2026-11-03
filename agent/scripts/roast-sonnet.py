#!/usr/bin/env python3
"""The roast skill's own roast, with Sonnet 5.5 through the claude CLI in codex's place.

  python -X utf8 agent/scripts/roast-sonnet.py plan|task|technical|search [roast.py's own flags]

The owner's answer of 2026-11-03: while codex refuses gpt-6.1-sol on the ChatGPT
account, a roast runs on Sonnet 5.5 through the claude CLI at high effort, with the
roast skill's own prompts. The same day: the CLI, never an Agent subagent, whose
model and effort the caller cannot be sure of. So this imports the skill and
changes one thing, the function that calls codex: the framing, jev's typed answers,
the reading and the record are the skill's, and the record names the model the CLI
reports it served rather than the one asked for. Sonnet is not the model that
builds here, so the rule that a model's work is never roasted by that same model
still holds.

The reviewer reads the repository and nothing else: it runs from a scratch folder
with the repository added, read-only tools only, the environment files denied and
every hook off, because the Ralph Stop hook in this repository would otherwise
hand the reviewer the loop's own prompt when it finishes.

Also the owner's, the same day: every call runs with --remote-control, so the
owner can watch the review among the remote sessions in the Claude app; there is
one claude conversation per kind of roast, kept and resumed across roasts as
codex's roast-<mode> sessions are; and the instructions put in front of the
skill's prompts are written by gpt-6-luna through the codex runner, not by the
builder. They live in roast-sonnet-prefix.txt, Luna's words exactly, from the
runner's purpose roast-prompts; a mistake in them goes back to Luna in that
session to fix.
"""

import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import uuid
from pathlib import Path

SKILL = Path("D:/Kar/Sijav-Skills/Sijav-Clauder/skills/roast")
sys.path.insert(0, str(SKILL))
import roast  # noqa: E402

MODEL, EFFORT = "claude-sonnet-5-5", "high"
REPO = Path(__file__).resolve().parents[2]
SCRATCH = Path(tempfile.gettempdir()) / "karnama-roast-sonnet"
# git runs from the scratch folder, so only through -C. Only log and show: diff and
# grep take --no-index, which reads any file on disk, a .env among them.
GIT = f"git -C {REPO.as_posix()}"
READ_ONLY = ["Read", "Grep", "Glob", f"Bash({GIT} log:*)", f"Bash({GIT} show:*)"]
DENIED = ["Read(**/.env)", "Read(**/.env.*)", "Edit", "Write", "NotebookEdit"]
# Luna's instructions, with the repository and the git prefix filled in.
PREFIX = (Path(__file__).with_name("roast-sonnet-prefix.txt").read_text(encoding="utf-8").strip()
          .replace("{repo}", REPO.as_posix()).replace("{git}", GIT))
# One claude conversation per kind of roast, kept between runs like the codex
# runner's sessions. A roast holds its kind's lock from its first call to its
# record, so a correction the skill sends back can never land in another roast's
# turn; a second roast of that kind waits. A lock older than any roast can run,
# three calls of an hour each, was left by a run that died.
SESSIONS = REPO / ".claude" / "claude-sessions"
STALE = 4 * 3600
# The models the CLI says it served this run, and the session it served them in.
SERVED: set[str] = set()
USED: dict[str, str] = {}


def acquired(purpose: str) -> Path:
    SESSIONS.mkdir(parents=True, exist_ok=True)
    lock = SESSIONS / f"{purpose}.lock"
    told = False
    while True:
        try:
            fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            try:
                age = time.time() - lock.stat().st_mtime
            except FileNotFoundError:
                continue  # released between the two calls
            if age > STALE:
                lock.unlink(missing_ok=True)
                continue
            if not told:
                print(f"[roast] the claude session {purpose} is in another roast; waiting for it", file=sys.stderr)
                told = True
            time.sleep(10)
            continue
        os.write(fd, f"{os.getpid()} {dt.datetime.now(dt.timezone.utc).isoformat()}\n".encode())
        os.close(fd)
        return lock


def remembered(purpose: str) -> tuple[Path, dict]:
    path = SESSIONS / f"{purpose}.json"
    if not path.exists():
        return path, {}
    try:
        return path, json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise roast.RoastError(f"the claude session record {path} is not JSON ({e}); look at it before deleting it") from e


def remember(path: Path, record: dict) -> None:
    spare = path.with_name(path.name + ".tmp")
    spare.write_text(json.dumps(record, indent=1), encoding="utf-8", newline="\n")
    os.replace(spare, path)


def sonnet(prompt: str, search: bool, purpose: str) -> str:
    claude = shutil.which("claude")
    if not claude:
        raise roast.RoastError("the claude CLI is not on PATH")
    SCRATCH.mkdir(parents=True, exist_ok=True)
    tools = READ_ONLY + (["WebSearch", "WebFetch"] if search else [])
    path, known = remembered(purpose)
    session = known.get("session_id")
    command = [claude, "-p", "--model", MODEL, "--effort", EFFORT, "--output-format", "json",
               "--remote-control", f"KarNama {purpose}",
               "--add-dir", str(REPO), "--permission-mode", "dontAsk",
               "--allowedTools", *tools, "--disallowedTools", *DENIED,
               "--settings", json.dumps({"disableAllHooks": True})]
    command += ["--resume", session] if session else ["--session-id", str(uuid.uuid4())]
    try:
        run = subprocess.run(command, input=f"{PREFIX}\n\n{prompt}", capture_output=True, text=True,
                             encoding="utf-8", errors="replace", cwd=SCRATCH, timeout=3600)
    except subprocess.TimeoutExpired as e:
        raise roast.RoastError(f"the claude CLI gave no reply within an hour for {purpose}") from e
    if run.returncode != 0:
        raise roast.RoastError(f"the claude CLI failed for {purpose} (exit {run.returncode}): "
                               f"{(run.stderr or run.stdout).strip()[:2000]}")
    try:
        reply = json.loads(run.stdout)
    except json.JSONDecodeError as e:
        raise roast.RoastError(f"the claude CLI's report is not JSON: {run.stdout.strip()[:500]}") from e
    text = reply.get("result")
    if reply.get("is_error") or not isinstance(text, str) or not text.strip():
        raise roast.RoastError(f"the claude CLI failed for {purpose}: {json.dumps(reply)[:2000]}")
    # The id the CLI reports is the conversation to resume next, whatever was asked.
    reported = reply.get("session_id") or session
    if not reported:
        raise roast.RoastError(f"the claude CLI reported no session id for {purpose}")
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    remember(path, {"purpose": purpose, "session_id": reported, "model": MODEL, "effort": EFFORT,
                    "created": known.get("created", now), "updated": now, "calls": known.get("calls", 0) + 1})
    USED[purpose] = reported
    models = set(reply.get("modelUsage") or {})
    if MODEL not in models:
        raise roast.RoastError(f"the claude CLI says it served {sorted(models) or 'nothing'} for {purpose}, not {MODEL}")
    SERVED.update(models)
    return text


# The skill's record names codex, and codex's session, as the reviewer; say who
# actually reviewed, as the CLI reported it.
RENAMED = {
    "## Facts codex checked itself": "## Facts the reviewer checked itself",
    "## codex's reading (its interpretation, not jev's)": "## The reviewer's reading (its interpretation, not jev's)",
    "## codex's critique (codex alone; jev was not used)": "## The reviewer's critique (alone; jev was not used)",
    "codex reviewed alone": "the reviewer reviewed alone",
}
skill_record = roast.record


def record(root, mode, a, jev_line, body):
    path = skill_record(root, mode, a, jev_line, body)
    helpers = sorted(SERVED - {MODEL})
    reviewer = (f"- reviewer: {MODEL} at {EFFORT} effort through the claude CLI, which reported serving it"
                + (f", and its own helper calls on {', '.join(helpers)}" if helpers else "")
                + f"; in codex's place (the owner's answer of 2026-11-03), session {USED.get(f'roast-{mode}', 'none')}, "
                f"remote control 'KarNama roast-{mode}'")
    for file in (path, root / ".claude" / "roast-result.md"):
        text = re.sub(r"^- codex: .*$", reviewer, file.read_text(encoding="utf-8"), count=1, flags=re.M)
        for old, new in RENAMED.items():
            text = text.replace(old, new)
        file.write_text(text, encoding="utf-8", newline="\n")
    return path


roast.codex = sonnet
roast.model_of = lambda mode: (MODEL, EFFORT)
roast.record = record

if __name__ == "__main__":
    os.chdir(REPO)
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode not in roast.MODES:
        sys.exit(roast.main())  # the skill prints its own usage
    lock = acquired(f"roast-{mode}")
    try:
        code = roast.main()
    finally:
        lock.unlink(missing_ok=True)
    sys.exit(code)
