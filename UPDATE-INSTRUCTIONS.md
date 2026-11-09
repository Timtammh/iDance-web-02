# Update your existing Git checkout safely

This snapshot is based on GitHub main `1f98084bb36d9442381d27af0923e24f7fe50c2a`, rechecked on 9 November 2026. Remote main was unchanged. No tracked files were deleted or renamed. No push has been performed.

## Before copying
1. Back up your existing local project folder, including hidden files. In Terminal, enter that existing checkout and run `git status` and `git remote -v`. Confirm it is Timtammh/iDance-web-02.
2. If you have local edits, commit them to a backup branch or save a separate backup before overwriting. This archive cannot know about edits on your Mac. Compare any newer local commits before merging.
3. Unzip this archive separately, for example in Downloads. Its top-level `iDance-web-02` folder contains the project files, not a Git repository.

## Recommended Mac copy method
Do NOT replace the existing project folder itself in Finder. Finder's Replace action on a directory can discard files not supplied by this archive, including .git, .env and local-only files. Dragging just src/public directories and choosing Replace can also lose your local-only files. A Finder Merge is not the same as replacing every modified file reliably.

Use a non-deleting file merge instead. Replace both sample paths below with your actual extracted source and existing checkout. Keep the trailing slash on the source. First run a dry run:

```sh
rsync -avn --exclude='.git/' --include='.env.example' --exclude='.env' --exclude='.env.*' --exclude='node_modules/' --exclude='dist/' '/path/to/extracted/iDance-web-02/' '/path/to/existing/iDance-web-02/'
```

Review the paths and listed files, then remove only the `n` from `-avn` to copy (`-av`). Never add `--delete`. These exclusions preserve .git and all .env/.env.* files at both root and studio level while allowing blank .env.example templates.

There are no required deletions or renames. The unused `src/sections/home/ProductModelViewer.tsx` is omitted as in prior no-3D packages; if already present locally, it can stay and is not imported. No GLB/GLTF asset is required. Old media files retained in the repository can remain.

## Verify before pushing yourself
From your existing checkout:

```sh
git status --short
git diff --stat
git diff --check
npm ci
npm run typecheck
npm run build
npm run lint
npm run dev
```

Review changed/new source, media and fonts. Make sure no .env, tokens, node_modules or dist files are staged. Then commit and push using your normal workflow. Nothing in this package pushes or deploys automatically. Existing local environment settings take precedence; preserve them rather than copying example files over them.

## Included current work
GA4 consent/carousel preparation; Sanity homepage fields; frosted glass and GSAP motion; full16:9 desktop video; eight full-frame mobile images; centered50%-width intro and slide-up entry; compact animated Products mega menu with All-category entries, single underline and no Pending badges; Bestigia h1/h2 headings at1% tracking; persistent compact Drums dock with play/pause, stop, mute, volume and no timer. Intro prompt text is30% smaller; dock is20% smaller.

## Limits and launch notes
- Full frontend build/typecheck, lint and isolated analytics checks were run in cloud Linux. One pre-existing ProductDeck hook warning remains. This is not a claim of a build on your Mac.
- Browser interactions were checked in managed desktop/mobile-width previews. Full Playwright execution is blocked by this cloud browser sandbox; supplied regression tests are not claimed to pass end-to-end. Some legacy tests still describe older demo content and may need further updates.
- Real GA4/Sanity accounts remain unconnected. Unknown category destinations stay plain text instead of broken links. Apps has no subcategories.
- Bestigia font metadata says ©2021 Ronny Studio, all rights reserved. The supplied font alone does not establish web/commercial licensing; confirm rights before public deployment.
- Audio starts when the visitor presses Play; phone volume may use device buttons. It continues across client-side page navigation, not a browser reload.
