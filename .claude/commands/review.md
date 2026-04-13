Review the current branch against the base branch.

Determine the base branch by checking which of `main` or `master` exists as a remote tracking branch. If the argument $ARGUMENTS is provided, use that as the base instead.

Run `git diff <base>...HEAD` to obtain the diff. If there are no changes, say so and stop.

Read `.github/REVIEW_PROMPT.md` for the full review instructions, severity definitions, and output format. Follow them exactly.

You may open files and search the codebase (using grep, find, or reading files) to verify assumptions about changed lines. Do not explore unrelated parts of the repository. Do not write or modify any files.

Print the review directly. Do not post it as a PR comment or anywhere else.
