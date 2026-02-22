#!/usr/bin/env python3
"""
Claude Code Local Session Log Watcher
- ~/.claude/projects/ 하위 JSONL 파일을 폴링
- thinking 블록, tool_use/tool_result, isSidechain 항목 필터링
- user/assistant 메시지만 Firestore에 업로드 (logger.py와 동일 컬렉션)
"""

from __future__ import annotations

import os
import sys
import json
import glob
import time
import re
import hashlib
import atexit
from datetime import datetime
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore

# ── Config ──────────────────────────────────────────────
CLAUDE_PROJECTS_DIR = os.path.expanduser("~/.claude/projects")
POLL_INTERVAL = 1  # seconds
FIRESTORE_COLLECTION = "chat_logs"
PID_FILE = os.path.expanduser("~/.claude/claude-logger.pid")
OFFSET_FILE = os.path.expanduser("~/.claude/claude-logger.offsets.json")

# 각 파일별 마지막으로 읽은 바이트 위치 추적
file_offsets: dict[str, int] = {}


# ── Offset Persistence ─────────────────────────────────
def load_offsets():
    global file_offsets
    try:
        with open(OFFSET_FILE, "r") as f:
            file_offsets = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        file_offsets = {}


def save_offsets():
    with open(OFFSET_FILE, "w") as f:
        json.dump(file_offsets, f)


def init_offsets_to_eof():
    """First run: set all offsets to end-of-file so we only watch new content."""
    pattern = os.path.join(CLAUDE_PROJECTS_DIR, "*/*.jsonl")
    for path in glob.glob(pattern):
        if path not in file_offsets:
            file_offsets[path] = os.path.getsize(path)
    save_offsets()


# ── PID Lock ────────────────────────────────────────────
def check_pid_lock():
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                old_pid = int(f.read().strip())
            os.kill(old_pid, 0)
            print(f"❌ Already running (PID {old_pid}). Exiting.")
            sys.exit(1)
        except (ProcessLookupError, ValueError):
            pass
        except PermissionError:
            print(f"❌ Already running (PID). Exiting.")
            sys.exit(1)

    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    atexit.register(cleanup_pid)


def cleanup_pid():
    try:
        os.remove(PID_FILE)
    except FileNotFoundError:
        pass


# ── Firebase Init ───────────────────────────────────────
SERVICE_ACCOUNT_PATH = "/Users/dyno/.config/firebase/project-a3e9a-adminsdk.json"


def init_firebase():
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", SERVICE_ACCOUNT_PATH)
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
    return firestore.client()


# ── Filters ─────────────────────────────────────────────
def extract_text(content) -> str:
    """Extract plain text only — skip thinking/tool_use/tool_result blocks."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                parts.append(part.get("text", ""))
            elif isinstance(part, str):
                parts.append(part)
        return "\n".join(parts)
    return str(content)


# System-injected user messages to skip (동일 패턴 유지)
SYSTEM_USER_PATTERNS = [
    r"^Pre-compaction memory flush\.",
    r"^Read HEARTBEAT\.md",
    r"^The conversation history before this point was compacted",
    # Claude Code context compaction / continuation messages
    r"^This session is being continued from a previous conversation",
    r"^Please continue the conversation from where we left off",
    r"^<system-reminder>",
    r"^You are running low on context",
    r"^## Silent Replies",
    r"^## Heartbeats",
    r"^## Runtime",
    r"^## Inbound Context",
    r"^\[system\]",
    r"^<system>",
]
_SYSTEM_USER_RE = re.compile("|".join(SYSTEM_USER_PATTERNS), re.MULTILINE)


_SYSTEM_REMINDER_RE = re.compile(r"<system-reminder>.*?</system-reminder>", re.DOTALL)
_SYSTEM_REMINDER_BLOCK_RE = re.compile(
    r"\n*<system-reminder>.*?</system-reminder>\n*", re.DOTALL
)


def strip_system_reminders(text: str) -> str:
    """Remove <system-reminder>...</system-reminder> blocks injected by Claude Code."""
    return _SYSTEM_REMINDER_BLOCK_RE.sub("\n", text).strip()


def is_system_injected(text: str) -> bool:
    return bool(_SYSTEM_USER_RE.search(text))


# ── Sensitive Data Redaction (logger.py와 동일) ─────────
_API_KEY_PATTERNS = [
    (r"sk-(?:proj-|svcacct-|ant-)?[A-Za-z0-9_-]{20,}", "[API_KEY]"),
    (r"AIza[A-Za-z0-9_-]{30,}", "[GOOGLE_KEY]"),
    (r"(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}", "[GITHUB_TOKEN]"),
    (r"github_pat_[A-Za-z0-9_]{30,}", "[GITHUB_TOKEN]"),
    (r"xox[bpras]-[A-Za-z0-9-]+", "[SLACK_TOKEN]"),
    (r"AKIA[A-Z0-9]{16}", "[AWS_KEY]"),
    (r"(?:aws_secret_access_key|aws_session_token)\s*[=:]\s*\S+", "[AWS_SECRET]"),
    (r"glpat-[A-Za-z0-9_-]{20,}", "[GITLAB_TOKEN]"),
    (r"npm_[A-Za-z0-9]{30,}", "[NPM_TOKEN]"),
    (r"(?<![A-Za-z0-9])\d{8,10}:[A-Za-z0-9_-]{34,43}(?![A-Za-z0-9])", "[TELEGRAM_BOT_TOKEN]"),
    (r"[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}", "[DISCORD_TOKEN]"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----", "[PRIVATE_KEY]"),
    (r"eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}", "[JWT_TOKEN]"),
    (r"(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{20,}", "[STRIPE_KEY]"),
    (r"sbp_[A-Za-z0-9]{30,}", "[SUPABASE_TOKEN]"),
    (r"vercel_[A-Za-z0-9_-]{20,}", "[VERCEL_TOKEN]"),
    (r"cf_[A-Za-z0-9_-]{30,}", "[CF_TOKEN]"),
    (r"\b[0-9a-f]{40,}\b", "[HEX_SECRET]"),
]

_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
_PHONE_PATTERNS = re.compile(
    r"(?:01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}"
    r"|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}"
    r"|\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4})"
)
_IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
_SAFE_IPS = {"127.0.0.1", "0.0.0.0", "255.255.255.255"}
_ABS_PATH_RE = re.compile(r"(?<!\w)((?:/[A-Za-z0-9._~@-]+){2,})(?!\w)")
_SENSITIVE_EXTENSIONS = {
    ".json", ".jsonl", ".key", ".pem", ".p12", ".pfx", ".env",
    ".cfg", ".conf", ".ini", ".yml", ".yaml", ".toml",
    ".sh", ".bash", ".zsh", ".py", ".js", ".ts", ".tsx", ".jsx",
    ".log", ".csv", ".db", ".sqlite", ".sql",
    ".cert", ".crt", ".secret", ".bak", ".tar", ".gz", ".zip", ".rar",
}
_SENSITIVE_FILE_EXTS = [e.lstrip(".") for e in _SENSITIVE_EXTENSIONS]
_STANDALONE_FILE_RE = re.compile(
    r"(?<![/A-Za-z0-9_])"
    r"(\.?[A-Za-z0-9_.-]+\.(?:" + "|".join(_SENSITIVE_FILE_EXTS) + r"))"
    r"(?![A-Za-z0-9_])"
)
_FILE_WHITELIST = {
    "package.json", "tsconfig.json", "setup.py", "requirements.txt",
    "Makefile", "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
    ".gitignore", ".env.example", "README.md", "LICENSE",
    "index.js", "index.ts", "main.py", "app.py", "app.js",
    "SKILL.md", "AGENTS.md", "SOUL.md", "USER.md", "MEMORY.md",
    "HEARTBEAT.md", "TOOLS.md", "IDENTITY.md", "BOOTSTRAP.md",
    "firestore.rules", "firebase.json",
}
_KEY_VALUE_RE = re.compile(
    r"(?i)(password|passwd|secret|token|api_key|apikey|api[-_]?secret"
    r"|auth|credential|private_key|access_key|client_secret"
    r"|db_password|database_url|redis_url|mongo_uri|connection_string)"
    r"\s*[=:]\s*"
    r"['\"]?([^\s'\"]{4,})['\"]?"
)
_PROJECT_REDACTIONS: dict[str, str] = {}


def redact_sensitive(text: str) -> str:
    for pattern, replacement in _API_KEY_PATTERNS:
        text = re.sub(pattern, replacement, text)

    text = _KEY_VALUE_RE.sub(lambda m: f"{m.group(1)}=[REDACTED]", text)
    text = _EMAIL_RE.sub("[EMAIL]", text)
    text = _PHONE_PATTERNS.sub("[PHONE]", text)

    def _mask_ip(m):
        ip = m.group(0)
        return ip if ip in _SAFE_IPS else "[IP_ADDR]"
    text = _IP_RE.sub(_mask_ip, text)

    def _mask_path(m):
        path = m.group(1)
        parts = path.rsplit("/", 1)
        basename = parts[-1] if len(parts) > 1 else parts[0]
        _, ext = os.path.splitext(basename)
        if basename in _FILE_WHITELIST:
            return basename
        if ext.lower() in _SENSITIVE_EXTENSIONS:
            return f"…/{basename}"
        home_match = re.match(r"^/(Users|home)/[^/]+", path)
        if home_match:
            remainder = path[len(home_match.group(0)):]
            segs = [s for s in remainder.split("/") if s]
            if len(segs) > 2:
                return "…/" + "/".join(segs[-2:])
            elif segs:
                return "…/" + "/".join(segs)
            else:
                return "~/…"
        return path
    text = _ABS_PATH_RE.sub(_mask_path, text)

    def _mask_file(m):
        fname = m.group(1)
        if fname in _FILE_WHITELIST:
            return fname
        return f"[FILE:{os.path.splitext(fname)[1]}]"
    text = _STANDALONE_FILE_RE.sub(_mask_file, text)

    text = re.sub(
        r"(?<![/A-Za-z0-9_])(\.env(?:\.[A-Za-z0-9_]+)?)(?![A-Za-z0-9_.])",
        lambda m: m.group(1) if m.group(1) in _FILE_WHITELIST else "[DOTENV]",
        text,
    )

    for keyword, replacement in _PROJECT_REDACTIONS.items():
        text = text.replace(keyword, replacement)

    return text


# ── Claude Code Entry Processing ─────────────────────────
def clean_message(entry: dict) -> dict | None:
    # isSidechain: tool result echoes — skip
    if entry.get("isSidechain", False):
        return None

    msg = entry.get("message", {})
    role = msg.get("role", "")

    # user 엔트리는 top-level content도 가능
    content = msg.get("content", "")

    if not role or not content:
        return None

    if role not in ("user", "assistant"):
        return None

    # extract_text: thinking/tool_use/tool_result 블록 자동 제외
    text = extract_text(content)

    # <system-reminder> 블록 제거 (Claude Code가 주입하는 툴 결과 등)
    text = strip_system_reminders(text)

    # 시스템 주입 메시지 스킵
    if role == "user" and is_system_injected(text):
        return None

    # 빈 메시지 스킵 (tool_use만 있던 어시스턴트 턴 등)
    if not text.strip():
        return None

    if text.strip() in ("HEARTBEAT_OK", "NO_REPLY"):
        return None

    text = redact_sensitive(text)

    return {
        "role": "home" if role == "assistant" else role,
        "content": text.strip(),
        "timestamp": entry.get("timestamp"),
        "model": msg.get("model"),
    }


def make_doc_id(entry: dict) -> str:
    """Deterministic doc ID — Claude Code uses 'uuid', fallback to message.id."""
    uid = entry.get("uuid") or entry.get("message", {}).get("id", "")
    raw = f"{uid}-{entry.get('timestamp', '')}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


# ── Session File Discovery ───────────────────────────────
def _relative_project_id(encoded: str) -> str:
    """Strip home-dir prefix from Claude's encoded project folder name.

    Claude encodes the project path as folder name with '/' → '-'.
    e.g. /Users/kong/workspace/yuna-hq  →  -Users-kong-workspace-yuna-hq
    We strip the home prefix so the stored agent field doesn't contain username.
    Result example: 'workspace-yuna-hq'
    """
    home = os.path.expanduser("~")
    encoded_home = home.replace("/", "-")  # e.g. -Users-kong
    if encoded.startswith(encoded_home):
        relative = encoded[len(encoded_home):].lstrip("-")
        return relative if relative else "home"
    return encoded


def get_session_files() -> list[tuple[str, str, str]]:
    """Return (project_id, session_id, file_path) tuples."""
    results = []
    pattern = os.path.join(CLAUDE_PROJECTS_DIR, "*/*.jsonl")
    for path in glob.glob(pattern):
        parts = path.split(os.sep)
        # ~/.claude/projects/<project>/<session>.jsonl
        project_id = _relative_project_id(parts[-2])
        session_id = os.path.splitext(parts[-1])[0]
        results.append((f"claude:{project_id}", session_id, path))
    return results


def read_new_lines(filepath: str) -> list[str]:
    offset = file_offsets.get(filepath, 0)
    try:
        size = os.path.getsize(filepath)
        if size < offset:
            offset = 0
        with open(filepath, "r") as f:
            f.seek(offset)
            lines = f.readlines()
            file_offsets[filepath] = f.tell()
            save_offsets()
            return lines
    except FileNotFoundError:
        return []


# ── Main Loop ───────────────────────────────────────────
def poll_once(db):
    session_files = get_session_files()
    total_uploaded = 0

    for agent_id, session_id, filepath in session_files:
        new_lines = read_new_lines(filepath)
        if not new_lines:
            continue

        batch = db.batch()
        batch_count = 0

        for line in new_lines:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            cleaned = clean_message(entry)
            if cleaned is None:
                continue

            doc_id = make_doc_id(entry)
            doc_ref = db.collection(FIRESTORE_COLLECTION).document(doc_id)

            cleaned["agent"] = agent_id
            cleaned["sessionId"] = session_id

            batch.set(doc_ref, cleaned)
            batch_count += 1

        if batch_count > 0:
            batch.commit()
            total_uploaded += batch_count

    if total_uploaded > 0:
        now = datetime.now().strftime("%H:%M:%S")
        print(f"[{now}] Uploaded {total_uploaded} messages")


def main():
    check_pid_lock()
    print(f"🤖 Claude Code Session Watcher starting... (PID {os.getpid()})")
    print(f"   Projects dir: {CLAUDE_PROJECTS_DIR}")
    print(f"   Poll interval: {POLL_INTERVAL}s")
    print(f"   Firestore collection: {FIRESTORE_COLLECTION}")
    print()

    db = init_firebase()
    print("✅ Firebase connected\n")

    load_offsets()
    if not file_offsets:
        print("📌 First run: skipping existing logs, watching new only")
        init_offsets_to_eof()

    while True:
        try:
            poll_once(db)
        except KeyboardInterrupt:
            print("\n👋 Watcher stopped.")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
