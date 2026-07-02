# SRS (source requirements)

Drop your **already-split** SRS excerpts here — one file per module/feature, not the whole
multi-module document. If your SRS is a Word doc converted via `pandoc` into one large Markdown
file with an images folder, extract just the section you're about to build and save it here,
keeping any image references relative and valid.

## Convention

```
docs/srs/
├── module-5-order-management.md
├── module-6-invoicing.md
└── images/                        # keep paths relative to match what pandoc generated
```

## Usage

This folder is **not** auto-read — `/plan` doesn't scan it on its own. Point to the file
explicitly when you start planning:

```
/plan

Đọc yêu cầu từ docs/srs/module-5-order-management.md
```

Keep these files committed — they're the record of what was actually asked for each module,
useful when a later module needs to know how an earlier one was scoped.
