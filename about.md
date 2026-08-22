# About Grapha

This is the markdown mirror of <https://grapha.ai/about.html>.

## What Grapha is

Grapha is a native macOS notes app. You write in markdown, the app renders what
you write instead of showing you the syntax, and the file on your disk stays
ordinary markdown the whole time. Notes live in a folder called `~/Grapha` —
one folder per note, holding a `note.md` alongside its images and its history.
Nothing about a note is proprietary. Open the folder in any other editor, or in
git, and it is all there.

There is no filing. No folders, no projects, no templates: you write, and the
note exists. Documents carry labels instead of a location, and a label is also
how you tell an agent which documents it may read.

## Why it exists

Note-taking apps were supposed to make thinking easier. Somewhere along the way
they started requiring more of it — folders to file, tags to assign, templates
to maintain, systems to uphold. What began as a way to hold onto ideas became
another thing to manage.

Grapha is built on a different belief: that the best thinking tool is one you
barely notice. Write freely, without deciding where something lives or what it
belongs to. That is the whole design brief, and every feature is measured
against it.

The second belief is that a note should be able to tell the truth. A figure
typed into a document is accurate on the day it is typed and quietly wrong from
then on. In Grapha a number in a sentence, or a chart in a page, can be bound
to a read-only database connection and be the real current figure. The app runs
the query locally; a language model is never handed a credential and never
executes anything.

## Agents in the margin

The coding agents people already pay for — Claude Code, Codex, Cursor — are
very good at reading and writing markdown, and terrible at being trusted with a
document unsupervised. So in Grapha an agent works in the margin: it leaves a
comment, or a suggested edit, and nothing it proposes lands in the file until
you accept it. It runs under your own subscription or API key, and it is handed
only the documents you have labelled for it. Everything else in the folder is
invisible to it.

## How it is funded

By people buying it, once. The markdown editor is free for everyone, forever,
with no key and no account. The agent harness is **$49 — a single payment, not
a subscription** — and it covers up to two Macs. Before you pay anything,
agents work free for 30 days from your first agent run, not from the day you
install.

There is no venture funding behind this, no free tier that expires into a
monthly bill, and no plan to sell anything else later. Payment is handled by
[Polar](https://polar.sh), who are the merchant of record; Grapha never sees a
card number.

## What Grapha never does

- No account, no server, no sync. Your notes are files, and they stay on your Mac.
- No telemetry, no usage tracking, no analytics, and no third-party scripts on this website.
- No proprietary format. Every rich thing in a note — a chart, a diagram, a live figure — is written into the markdown as text you can read.
- No write access to a database you connect. Connections are read-only, and the credential lives in the macOS Keychain.

The full detail is on the [privacy page](https://grapha.ai/privacy.md), which
is short and factual rather than long and legal.

## Who makes it

Grapha is an independent, self-funded project built in **Ottawa, Canada**. It
is distributed directly as a notarized download rather than through the Mac App
Store, because the App Store sandbox forbids launching the coding agent
binaries the app is built around.

Support, bugs and feature requests all reach a person:
[support@grapha.ai](mailto:support@grapha.ai), or the
[public roadmap](https://grapha.userjot.com/roadmap), where you can see what is
planned, what is being built and what has shipped. More ways to get in touch
are on the [contact page](https://grapha.ai/contact.md).

## Links

- [Home](https://grapha.ai/index.md)
- [Contact](https://grapha.ai/contact.md)
- [For agents and developers](https://grapha.ai/agents.md)
- [Privacy](https://grapha.ai/privacy.md)
