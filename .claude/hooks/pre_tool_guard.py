import re
import sys

from shared import deny_tool, read_input


input_data = read_input()
command = str(input_data.get("tool_input", {}).get("command", ""))

checks = [
    (
        r"\brm\s+-(?:[^\s]*r[^\s]*f|[^\s]*f[^\s]*r)\b",
        "Blocked destructive recursive force delete. Ask the user for explicit approval and scope it narrowly.",
    ),
    (
        r"\bgit\s+(reset\s+--hard|clean\s+-[^\n]*[fdx])",
        "Blocked destructive git cleanup/reset. Preserve user work unless explicitly approved.",
    ),
    (
        r"\bgit\s+push\b[^\n]*--force",
        "Blocked force push. Ask for explicit approval and explain the branch impact.",
    ),
    (
        r"\bchmod\s+(?:-R\s+)?777\b",
        "Blocked broad chmod 777. Use the narrowest permission change instead.",
    ),
    (
        r"\bcurl\b[^\n|]*\|\s*(?:sh|bash|zsh)\b",
        "Blocked piping remote scripts into a shell. Download, inspect, and ask for approval first.",
    ),
    (
        r"\b(?:cat|sed|awk|grep|rg|less|more)\b[^\n]*(?:^|[\s/])\.env(?:$|[\s./])",
        "Blocked reading env/secret files through shell. Use documented examples or ask the user for the specific value needed.",
    ),
]

for pattern, reason in checks:
    if re.search(pattern, command):
        deny_tool("PreToolUse", reason)
        sys.exit(0)
