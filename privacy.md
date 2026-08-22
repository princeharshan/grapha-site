# Privacy

The markdown mirror of <https://grapha.ai/privacy.html>. Same words, no design.

## Your notes

Your notes are Markdown files in a folder on your Mac. Grapha has no server, no
account, and no sync. Nothing you write is uploaded to us — there is no us to
upload it to. The one way note text can leave your Mac is a door you open
yourself: working with an agent, described below.

## Databases you connect

Connections are read-only and run from your Mac. Credentials are stored in the
macOS Keychain and never leave it. A language model is never given a credential
and never executes a query — the app runs the query locally.

## Agents you connect

You can set up an AI agent — Claude, Codex, or Cursor — to work on your notes.
Agents only read the notes you have labelled for them. When an agent works,
those labelled notes go to the model vendor behind it, under your own key or
subscription — the exchange is between your Mac and the vendor you chose, and
Grapha is not in the middle of it. Notes you have not labelled are never handed
to an agent, and if you never set an agent up, nothing you write leaves at all.

Adding an API key in **Settings ▸ AI** makes one small request to that vendor to
confirm the key works. It carries the key and nothing else.

## Link previews

Hover over a link in a note and Grapha fetches that page to draw a small
preview card — the same request your browser would make if you clicked. Nothing
from your note travels with it beyond the address itself. You can switch
previews off in **Settings ▸ General**.

## Checking for updates

Once a day, Grapha reads a single static file from this website to learn whether
a newer version exists. The request carries no identifier: no account, no device
id, no licence key, not even your version number. Everybody who asks gets the
same file. You can switch the check off in **Settings ▸ General**.

## Crash reports

macOS writes a crash report to your own disk whenever an app on your Mac stops
unexpectedly. If Grapha finds one of its own, it asks whether to send it, and it
shows you the exact text first. Nothing is sent unless you press Send. The
report contains the app version, your macOS version, and the technical stack
trace of the failure. It contains no note text, no file names, no file paths and
no database details.

Reports go to our public feedback board so duplicates can be merged and the
worst bugs prioritised. Your Mac is identified there only by an irreversible
one-way hash, and only so that ten reports of one bug from one person are not
mistaken for ten people. You can turn crash reporting off permanently the first
time you are asked, or later in **Settings ▸ General**.

## Buying

Payment is handled by [Polar](https://polar.sh), who are the merchant of record
and hold the payment details. Grapha never sees a card number. Unlocking checks
your licence key once; after that the app never contacts the licence service
again.

## Analytics

There are none. No telemetry, no usage tracking, no session recording, no
third-party scripts on this website.

## Getting in touch

[support@grapha.ai](mailto:support@grapha.ai)

## Links

- [Home](https://grapha.ai/index.md)
- [About](https://grapha.ai/about.md)
- [Contact](https://grapha.ai/contact.md)
- [For agents and developers](https://grapha.ai/agents.md)
