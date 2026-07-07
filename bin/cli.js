#!/usr/bin/env node
/**
 * angular-vibe-kit installer
 *
 * Deterministic, no AI. Detects the target project's Angular version from
 * package.json, then scaffolds the Vibe Coding workspace:
 *
 *   CLAUDE.md                      ← project root (entry point)
 *   docs/                          ← reference docs
 *     ARCHITECTURE.md
 *     api-contracts/               ← README.md index + one file per feature (filled by /init)
 *     DESIGN_SYSTEM.md
 *     PROJECT-STATUS.md
 *     decisions/
 *   .claude/
 *     commands/                    ← 11 slash-commands
 *     angular-practices/<ver>.md   ← version-matched best-practice file
 *     skills/                      ← skills Claude auto-applies (no command needed)
 *     agents/                      ← Angular subagents (isolated context, run in parallel)
 *     settings.json                ← allowlist (fewer prompts) + build-verify hook
 *     rules/
 *       project-rules.md           ← auto-loaded by Claude Code every session
 *
 * Generation (filling in actual content) happens later via /init in Claude Code.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative } from "node:path";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = resolve(__dirname, "..");

// --- package metadata (single source of truth = package.json) -----------
const require = createRequire(import.meta.url);
const pkg = require("../package.json");
const VERSION = pkg.version;
const HOMEPAGE = pkg.homepage;

// --- tiny ansi helpers (no deps) -----------------------------------------
const c = { reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m" };
const log = (msg = "") => process.stdout.write(msg + "\n");
const ok  = (msg) => log(`${c.green}✓${c.reset} ${msg}`);
const warn = (msg) => log(`${c.yellow}!${c.reset} ${msg}`);
const err  = (msg) => log(`${c.red}✗${c.reset} ${msg}`);

// --- arg parsing ----------------------------------------------------------
const args = process.argv.slice(2);
const flags = {
  force:   args.includes("--force"),
  dryRun:  args.includes("--dry-run"),
  help:    args.includes("--help") || args.includes("-h"),
  version: getFlagValue("--version"),
};

function getFlagValue(name) {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] ?? null);
}

function printHelp() {
  log(`${c.bold}angular-vibe-kit${c.reset} — bootstrap the Vibe Coding workflow into an Angular project

${c.bold}Usage${c.reset}
  npx @tungvivas/angular-vibe-kit [options]

${c.bold}Options${c.reset}
  --version <n>   Override detected Angular major version (e.g. 17)
  --force         Overwrite files that already exist
  --dry-run       Show what would happen without writing anything
  -h, --help      Show this help

${c.bold}What gets created${c.reset}
  CLAUDE.md                       ← project root entry point
  docs/                           ← reference docs (fill in with /init)
  .claude/commands/               ← 11 slash-commands
  .claude/angular-practices/      ← version-matched best-practice file
  .claude/skills/                 ← skills Claude auto-applies (no command needed)
  .claude/agents/                 ← Angular subagents (isolated context, run in parallel)
  .claude/settings.json           ← allowlist (fewer prompts) + build-verify hook
  .claude/rules/project-rules.md  ← auto-loaded every Claude Code session`);
}

// --- version detection ----------------------------------------------------
const MIN_SUPPORTED = 12;
const PRACTICE_BY_MAJOR = {
  12: "v12-13.md", 13: "v12-13.md",
  14: "v14-15.md", 15: "v14-15.md",
  16: "v16.md",
  17: "v17.md",
  18: "v18-19.md", 19: "v18-19.md",
  20: "v20plus.md",           // Signal-native: zoneless stable, signals graduated; resource/httpResource still experimental
};
const NEWEST_PRACTICE = "v20plus.md"; // fallback for v21+ (future)

function detectAngularMajor(cwd) {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return { major: null, reason: "no package.json found" };
  let pkg;
  try {
    const raw = readFileSync(pkgPath, "utf8").replace(/^﻿/, ""); // strip BOM
    pkg = JSON.parse(raw);
  } catch { return { major: null, reason: "package.json is not valid JSON" }; }
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const raw = deps["@angular/core"] || deps["@angular/cli"];
  if (!raw) return { major: null, reason: "no @angular/core or @angular/cli dependency" };
  const match = String(raw).match(/(\d+)\s*\.\s*\d+/) || String(raw).match(/(\d+)/);
  if (!match) return { major: null, reason: `could not parse version "${raw}"` };
  return { major: Number(match[1]), reason: null, raw };
}

function resolvePractice(major) {
  if (major === null) return { file: null, issue: "unknown" };
  if (major < MIN_SUPPORTED) return { file: null, issue: "below-min" };
  if (PRACTICE_BY_MAJOR[major]) return { file: PRACTICE_BY_MAJOR[major], issue: null };
  // v20+ future: use newest
  return { file: NEWEST_PRACTICE, issue: "future" };
}

// --- copy helpers ---------------------------------------------------------
let copied = 0;
let skipped = 0;

function ensureDir(dir) {
  if (!flags.dryRun) mkdirSync(dir, { recursive: true });
}

function copyOne(src, dest, cwd) {
  const rel = relative(cwd, dest);
  if (existsSync(dest) && !flags.force) {
    warn(`skip (exists): ${rel}`);
    skipped++;
    return;
  }
  if (flags.dryRun) {
    log(`${c.dim}would copy → ${rel}${c.reset}`);
    copied++;
    return;
  }
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  ok(rel);
  copied++;
}

function copyDir(srcDir, destDir, cwd) {
  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    if (statSync(srcPath).isDirectory()) copyDir(srcPath, destPath, cwd);
    else copyOne(srcPath, destPath, cwd);
  }
}

// Write generated content to a file, honoring --force / --dry-run like copyOne.
function writeOne(content, dest, cwd) {
  const rel = relative(cwd, dest);
  if (existsSync(dest) && !flags.force) {
    warn(`skip (exists): ${rel}`);
    skipped++;
    return;
  }
  if (flags.dryRun) {
    log(`${c.dim}would create → ${rel}${c.reset}`);
    copied++;
    return;
  }
  ensureDir(dirname(dest));
  writeFileSync(dest, content);
  ok(rel);
  copied++;
}

// Angular profile filename → human label for the skill description.
// e.g. "v20plus.md" → "v20+", "v18-19.md" → "v18-19", "v17.md" → "v17"
function profileLabel(practiceFile) {
  return practiceFile.replace(/\.md$/, "").replace(/plus$/, "+");
}

// Detect the package manager from the target project's lockfile.
function detectPackageManager(cwd) {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

// Resolve the build-verify command for the Stop hook. Prefers a project "typecheck"
// script; otherwise falls back to a fast type-check (npx tsc --noEmit). Returns null
// only if there is no package.json at all.
function buildVerifyCommand(cwd) {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return null;
  const pm = detectPackageManager(cwd);
  try {
    const raw = readFileSync(pkgPath, "utf8").replace(/^﻿/, "");
    const scripts = (JSON.parse(raw).scripts) || {};
    if (scripts.typecheck) return pm === "npm" ? "npm run typecheck" : `${pm} typecheck`;
  } catch { /* fall through to tsc */ }
  // Fast type-check that works without an Angular-specific script.
  // Swap for `ng build` / `${pm} run build` if you want full template checking.
  return "npx tsc --noEmit";
}

// Build the .claude/settings.json object: a safe allowlist + (optionally) a Stop hook
// that type-checks only when .ts/.html files changed since HEAD (skips question-only turns).
function buildSettings(cwd) {
  const settings = {
    permissions: {
      allow: [
        "Bash(ng *)", "Bash(npm *)", "Bash(npx *)", "Bash(pnpm *)", "Bash(yarn *)",
        "Bash(git status *)", "Bash(git diff *)", "Bash(git log *)", "Bash(git show *)",
      ],
    },
  };
  const buildCmd = buildVerifyCommand(cwd);
  if (buildCmd) {
    const hookCmd = `git diff --quiet HEAD -- '*.ts' '*.html' || ${buildCmd}`;
    settings.hooks = {
      Stop: [{ hooks: [{ type: "command", command: hookCmd }] }],
    };
  }
  return { settings, buildCmd };
}

// --- main -----------------------------------------------------------------
function main() {
  if (flags.help) { printHelp(); return; }

  const cwd = process.cwd();
  log(`${c.bold}angular-vibe-kit${c.reset} ${c.dim}v${VERSION}${c.reset}`);
  if (flags.dryRun) warn("dry-run: no files will be written");
  log("");

  // 1. detect version
  let major;
  if (flags.version) {
    major = Number(flags.version);
    log(`Using forced Angular version: ${c.cyan}${major}${c.reset}`);
  } else {
    const detected = detectAngularMajor(cwd);
    if (detected.major) {
      major = detected.major;
      log(`Detected Angular version: ${c.cyan}${major}${c.reset} ${c.dim}(${detected.raw})${c.reset}`);
    } else {
      err(`Cannot detect Angular version: ${detected.reason}`);
      log("");
      log(`${c.bold}Fix options:${c.reset}`);
      log(`  1. Run inside the Angular project folder (where package.json lives)`);
      log(`  2. Use ${c.cyan}--version <n>${c.reset} to specify manually, e.g. ${c.cyan}--version 17${c.reset}`);
      process.exit(1);
    }
  }

  // 2. resolve which practice file to use
  const { file: practice, issue } = resolvePractice(major);

  if (issue === "below-min") {
    err(`Angular ${major} is below the minimum supported version (${MIN_SUPPORTED}).`);
    log("");
    log(`${c.bold}Supported versions:${c.reset} 12, 13, 14, 15, 16, 17, 18, 19`);
    log(`If you still want to proceed, use the closest profile:`);
    log(`  ${c.cyan}npx @tungvivas/angular-vibe-kit --version 12${c.reset}  (v12-13 best practices)`);
    process.exit(1);
  }

  if (issue === "future") {
    warn(`Angular ${major} has no dedicated profile yet — using v20+ profile (${NEWEST_PRACTICE}).`);
    warn(`Check ${HOMEPAGE} for a dedicated update.`);
  }

  log(`Best-practice profile: ${c.cyan}${practice}${c.reset}`);
  log("");

  const claudeDir = join(cwd, ".claude");

  // 3. CLAUDE.md → project root
  log(`${c.bold}Entry point${c.reset}`);
  copyOne(join(KIT_ROOT, "templates", "CLAUDE.md"), join(cwd, "CLAUDE.md"), cwd);
  log("");

  // 4. docs/ → project root/docs/
  log(`${c.bold}Docs${c.reset} → docs/`);
  copyDir(join(KIT_ROOT, "templates", "docs"), join(cwd, "docs"), cwd);
  log("");

  // 5. .claude/commands/ → 11 slash-commands
  log(`${c.bold}Commands${c.reset} → .claude/commands/`);
  copyDir(join(KIT_ROOT, "commands"), join(claudeDir, "commands"), cwd);
  log("");

  // 6. .claude/angular-practices/ → 1 matched BP file
  log(`${c.bold}Best practices${c.reset} → .claude/angular-practices/`);
  const practiceSrc = join(KIT_ROOT, "practices", practice);
  if (existsSync(practiceSrc)) {
    copyOne(practiceSrc, join(claudeDir, "angular-practices", practice), cwd);
  } else {
    err(`practice file missing in kit: ${practice}`);
  }
  log("");

  // 7. .claude/rules/project-rules.md → auto-loaded by Claude Code
  log(`${c.bold}Rules${c.reset} → .claude/rules/ ${c.dim}(auto-loaded every session)${c.reset}`);
  copyOne(
    join(KIT_ROOT, "templates", "rules", "project-rules.md"),
    join(claudeDir, "rules", "project-rules.md"),
    cwd
  );
  log("");

  // 7b. .claude/references/ → shared source of truth for review/test (read by both commands & agents)
  log(`${c.bold}References${c.reset} → .claude/references/ ${c.dim}(shared standards for commands + agents)${c.reset}`);
  copyDir(join(KIT_ROOT, "references"), join(claudeDir, "references"), cwd);
  log("");

  // 8. .claude/skills/ → model-invoked skills (auto-applied by Claude, no command needed)
  log(`${c.bold}Skills${c.reset} → .claude/skills/ ${c.dim}(auto-applied by Claude — no command needed)${c.reset}`);
  const skillsDir = join(claudeDir, "skills");
  const kitSkillsDir = join(KIT_ROOT, "skills");

  // Static skills: copy each folder wholesale (preserves templates/ and references/ subfiles).
  // angular-practices is the only generated one (needs profile injection) — handled below.
  for (const skill of readdirSync(kitSkillsDir)) {
    if (skill === "angular-practices") continue;
    const src = join(kitSkillsDir, skill);
    if (!statSync(src).isDirectory()) continue;
    copyDir(src, join(skillsDir, skill), cwd);
  }

  // angular-practices: generated — inject the matched profile filename + label
  const apTemplate = join(kitSkillsDir, "angular-practices", "SKILL.md");
  if (existsSync(apTemplate)) {
    const body = readFileSync(apTemplate, "utf8")
      .replace(/\{\{PRACTICE_FILE\}\}/g, practice)
      .replace(/\{\{NG_PROFILE_LABEL\}\}/g, profileLabel(practice));
    writeOne(body, join(skillsDir, "angular-practices", "SKILL.md"), cwd);
  } else {
    err(`skill template missing in kit: angular-practices/SKILL.md`);
  }
  log("");

  // 9. .claude/agents/ → Angular-specialized subagents (isolated context, run in parallel)
  log(`${c.bold}Agents${c.reset} → .claude/agents/ ${c.dim}(isolated context — dispatch to run in background/parallel)${c.reset}`);
  copyDir(join(KIT_ROOT, "agents"), join(claudeDir, "agents"), cwd);
  log("");

  // 10. .claude/settings.json → permission allowlist + Stop-hook build verify
  log(`${c.bold}Settings${c.reset} → .claude/settings.json ${c.dim}(allowlist + build verify)${c.reset}`);
  const { settings, buildCmd } = buildSettings(cwd);
  if (!buildCmd) warn("no package.json found — writing permissions only (no build-verify hook)");
  writeOne(JSON.stringify(settings, null, 2) + "\n", join(claudeDir, "settings.json"), cwd);
  log("");

  // 11. summary
  log(`${c.bold}Done.${c.reset} ${copied} file(s) created, ${skipped} skipped.`);
  if (skipped > 0 && !flags.force) log(`${c.dim}Re-run with --force to overwrite skipped files.${c.reset}`);
  log("");
  log(`${c.bold}Next steps${c.reset}`);
  log(`  1. Open this project in ${c.cyan}Claude Code${c.reset}.`);
  log(`  2. Run ${c.cyan}/init${c.reset} — it will scan your codebase and fill in all the docs.`);
  log(`  3. Each session: ${c.cyan}/start${c.reset} → work → ${c.cyan}/update-status${c.reset}.`);
  log("");
  log(`${c.dim}Skills in .claude/skills/ apply automatically when you write or review`);
  log(`Angular code — no command needed to trigger them.`);
  log(`Agents in .claude/agents/ run in an isolated context — ask Claude to use one`);
  log(`(e.g. "use angular-build-fixer to fix this build error"), even in the background.`);
  log(`settings.json pre-allows ng/npm/pnpm/yarn/git-read (fewer prompts) and type-checks`);
  log(`at turn end only when .ts/.html changed. Remove its "hooks" block to disable.${c.reset}`);
}

main();
