Review and fix the current branch against the base branch.

Determine the base branch by checking which of `main` or `master` exists as a remote tracking branch. If the argument $ARGUMENTS is provided, use that as the base instead.

Run `git diff <base>...HEAD` to obtain the diff. If there are no changes, say so and stop.

Read `.github/REVIEW_PROMPT.md` for the full review instructions, severity definitions, and output format. Follow them exactly.

You may open files and search the codebase (using grep, find, or reading files) to verify assumptions about changed lines.

## Fix cycle

After completing the review, if there are any MEDIUM or above issues:

1. Fix each issue in the code. Keep changes minimal and focused - only fix what the review identified. Do not refactor, reorganise, or "improve" surrounding code.
2. After applying all fixes, re-run `git diff <base>...HEAD` to get the updated diff.
3. Review the updated diff again using the same rules from REVIEW_PROMPT.md. Only report new issues introduced by your fixes - do not re-report issues that have already been resolved.
4. If new issues are found, fix them and review again.
5. Repeat until a clean review pass with no MEDIUM or above issues, or you have completed 3 fix cycles (whichever comes first).

If you hit the 3-cycle limit with issues still remaining, stop and report what's left so it can be resolved manually.

## Output

Print each review pass as you go, clearly labelled (e.g. "Review pass 1", "Review pass 2"). After the final pass, print a short summary of all changes made.

Do not commit the changes.
