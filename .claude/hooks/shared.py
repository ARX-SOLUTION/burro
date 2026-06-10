import json
import os
import sys
from pathlib import Path


def read_input():
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}


def project_dir():
    return Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))


def write_json(value):
    sys.stdout.write(json.dumps(value, separators=(",", ":")) + "\n")


def add_context(hook_event_name, text):
    text = (text or "").strip()
    if not text:
        return
    write_json(
        {
            "hookSpecificOutput": {
                "hookEventName": hook_event_name,
                "additionalContext": text,
            }
        }
    )


def deny_tool(hook_event_name, reason):
    write_json(
        {
            "hookSpecificOutput": {
                "hookEventName": hook_event_name,
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
    )


def append_state_file(name, record):
    path = project_dir() / ".claude" / "state" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, separators=(",", ":")) + "\n")
