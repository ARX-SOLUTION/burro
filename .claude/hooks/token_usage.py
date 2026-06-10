from datetime import datetime, timezone

from shared import append_state_file, read_input


input_data = read_input()
response = input_data.get("tool_response", {}) or {}
usage = response.get("usage", {}) or {}
total_tokens = response.get("totalTokens")

if total_tokens is None:
    total_tokens = (usage.get("input_tokens") or 0) + (usage.get("output_tokens") or 0)

if total_tokens:
    append_state_file(
        "agent-token-usage.jsonl",
        {
            "at": datetime.now(timezone.utc).isoformat(),
            "sessionId": input_data.get("session_id"),
            "toolUseId": input_data.get("tool_use_id"),
            "subagent": input_data.get("tool_input", {}).get("subagent_type"),
            "description": input_data.get("tool_input", {}).get("description"),
            "totalTokens": total_tokens,
            "usage": usage,
        },
    )
