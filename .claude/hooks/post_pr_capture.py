import re
from datetime import datetime, timezone

from shared import add_context, append_state_file, project_dir, read_input


input_data = read_input()
command = str(input_data.get("tool_input", {}).get("command", ""))

# Only act after a `gh pr create` invocation.
if "gh pr create" not in command:
    raise SystemExit(0)

# Bash tool_response shape varies; gather any text it might carry.
response = input_data.get("tool_response", {})
if isinstance(response, str):
    text = response
elif isinstance(response, dict):
    text = " ".join(
        str(response.get(k, ""))
        for k in ("stdout", "stderr", "output", "content", "result")
    )
else:
    text = str(response)

match = re.search(r"https://github\.com/[\w.-]+/[\w.-]+/pull/\d+", text)
if not match:
    raise SystemExit(0)

url = match.group(0)
at = datetime.now(timezone.utc).isoformat()

# Latest pointer (overwrite) + append-only audit log.
latest = project_dir() / ".claude" / "state" / "last-pr.txt"
latest.parent.mkdir(parents=True, exist_ok=True)
latest.write_text(f"{url}\n{at}\n", encoding="utf-8")

append_state_file(
    "pr-created.jsonl",
    {
        "at": at,
        "sessionId": input_data.get("session_id"),
        "url": url,
    },
)

add_context("PostToolUse", f"PR created: {url} (saved to .claude/state/last-pr.txt)")
