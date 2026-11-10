# Latest iDance source: 10 November 2026

Full source snapshot of the current preview, including all local media and font assets, tests, package lockfiles, and Sanity Studio source. This is not a Git repository. No GitHub push or deployment was performed.

## Safe update
1. Download and extract separately. Keep your existing Git checkout at /Users/designer4/Desktop/Timothy/iDance-web-02.
2. Back up that existing folder, including hidden files. Check `git status` and `git remote -v` there. If you have uncommitted edits, preserve and compare them before copying.
3. Merge the extracted iDance-web-02 contents into your existing checkout with rsync. Replace SOURCE below with the actual extracted folder. First preview:

```sh
rsync -avn --exclude='.git/' --include='.env.example' --exclude='.env' --exclude='.env.*' --exclude='node_modules/' --exclude='dist/' 'SOURCE/' '/Users/designer4/Desktop/Timothy/iDance-web-02/'
```

Then use `-av` instead of `-avn`. Never add `--delete`. Do not replace the entire existing project folder in Finder. Preserve .git and all local environment files.

4. In the existing checkout, review and check:

```sh
git status --short
git diff --stat
git diff --check
npm ci
npm run build
```

5. Review exactly what to stage. Existing unrelated local files should not be added. Yesterday's excluded files were src/logo.svg and .DS_Store. They are absent from this archive. The current source does not need src/logo.svg; before removing a local copy, check it has not been newly used in local work. .DS_Store is now ignored. No existing files are automatically deleted by this overlay.
6. Once changes are reviewed, stage the intended files, inspect `git diff --cached --stat`, commit with a descriptive message, then `git push origin main` only if you are on the intended main branch. Do not use force push. If rejected because remote changed, stop and reconcile rather than overwriting it.

## Verification
Typecheck and production build passed on 10 November 2026 in cloud Linux. ESLint has zero errors and one existing ProductDeck useEffect dependency warning. Browser/end-to-end tests were not rerun for this packaging task. Studio source is included but its independent build was not run. No claim is made about your local Mac build or current remote branch state.

The snapshot includes the current menu/category link and layout updates. The zip contains no dependencies, compiled output, .git, local secrets, test output, or hosting-specific .openai metadata. All current project media is retained; an unused-looking asset is not treated as permission to delete it.
