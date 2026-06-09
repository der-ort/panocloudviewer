# Upgrade Prompt: Update `@der-ort/pano-cloud-viewer` and Adopt Professional Mode

> Paste this entire file into your app's coding agent. It is written as instructions to that agent.

---

You are updating an app that embeds **`@der-ort/pano-cloud-viewer`** — an embeddable React + Three.js point-cloud and 360° panorama viewer. The app is currently stuck on an **old version** of this viewer. Your job is to (a) refresh the dependency to the latest `master`, and (b) enable and verify the new **professional mode** UI.

The viewer is consumed as a **git dependency**, not a registry package:

```json
"@der-ort/pano-cloud-viewer": "github:der-ort/panocloudviewer&path:packages/viewer"
```

The prebuilt `packages/viewer/dist` is self-contained (the headless core is bundled into it at build time), so you never resolve a separate core package.

Work through the steps below in order. Stay **framework-agnostic** (the host app may be Next.js, Vite, or CRA) and **package-manager-agnostic** (npm, pnpm, or yarn).

---

## 1. Refresh the git dependency to the latest `master`

Because this is a **git dependency**, your lockfile most likely pins an **old commit SHA**. Reinstalling alone will NOT pull the new code — the resolved commit is cached in the lockfile (and in `node_modules`). You must clear or update that pinned resolution first.

### 1a. Confirm the dependency spec

Open `package.json` and confirm the dependency points at `master` (no `#<sha>` or `#<tag>` suffix that would pin it):

```json
"dependencies": {
  "@der-ort/pano-cloud-viewer": "github:der-ort/panocloudviewer&path:packages/viewer"
}
```

If it includes an explicit `#<commit>` / `#<branch>` ref that pins it to an old revision, remove that ref so it tracks `master`.

### 1b. Clear the pinned resolution and update from git

Use the command for your package manager. Each of these re-resolves the git dependency to the latest commit on `master`:

```bash
# npm
npm update @der-ort/pano-cloud-viewer

# pnpm
pnpm update @der-ort/pano-cloud-viewer --latest

# yarn (v2+/berry)
yarn up @der-ort/pano-cloud-viewer
```

If the update command still resolves the old commit (git deps are sometimes sticky), force it by clearing the cached entry and reinstalling:

```bash
# 1) Remove the package's installed copy
rm -rf node_modules/@der-ort/pano-cloud-viewer

# 2) Remove the lockfile entry for this dependency
#    - npm:  delete the "@der-ort/pano-cloud-viewer" block in package-lock.json
#    - pnpm: delete its entries in pnpm-lock.yaml
#    - yarn: delete its entry in yarn.lock
#    (If unsure, deleting the whole lockfile and reinstalling also works,
#     at the cost of re-resolving every dependency.)

# 3) Reinstall
npm install      # or: pnpm install   |   yarn install
```

### 1c. Confirm the new commit was resolved

Verify the lockfile now references a **new commit hash** for this dependency (search the lockfile for `der-ort/panocloudviewer` and check the `resolved` / `commit` field changed). You can cross-check against the latest `master` SHA on GitHub.

### 1d. Rebuild the consuming app

Rebuild with your app's normal build command, for example:

```bash
npm run build      # or: pnpm build   |   yarn build
# dev server, e.g.:  npm run dev
```

---

## 2. Enable & verify professional mode

Render the viewer with `uiMode="professional"`. This is the default, but set it explicitly so the intent is clear and you don't accidentally inherit `"minimal"`.

```tsx
import { PanoCloudViewer } from "@der-ort/pano-cloud-viewer";
// Import the viewer theme CSS once (see Troubleshooting if styles look off).

export function Viewer() {
  return (
    <PanoCloudViewer
      source={{ /* your existing point-cloud source config */ }}
      uiMode="professional"
    />
  );
}
```

`uiMode` accepts `"professional" | "minimal"` (default `"professional"`). Keep the rest of your existing `<PanoCloudViewer source={...} />` props as they were — only the dependency version and (optionally) `uiMode` need to change.

---

## 3. New behaviors to confirm (what "updated" looks like)

After upgrading, the professional-mode UI should exhibit the following user-visible changes. These tell you the new code is actually running:

- **XYZ axis indicator** is now anchored in the **bottom-left** corner of the viewport. The previous stray **gray dot in the top-right is gone**.
- **Minimap** is now anchored in the **bottom-right** corner of the viewport.
- **Clipping / section tool**:
  - There is a global **on/off toggle** that turns the whole cut on/off **without deleting** any section boxes.
  - All section boxes share **one consistent cut mode** (you no longer get mixed/contradictory cuts).
  - The **default section box is shorter** — it stays within the viewport instead of extending out of view.
- **Layout**:
  - The right **sidebar no longer overlaps/covers the top toolbar** — the toolbar stays fully visible when the sidebar is open.
  - The sidebar has a **chevron toggle on its side** to open and close it.
- **Settings**:
  - Professional mode now has a simple **quick-settings popover** opened from a **gear button** in the toolbar. It exposes the common controls: **panoramas toggle, minimap toggle, color mode, and point size**.
  - This is **in addition to** the existing advanced **"Rendering Settings" modal** (opened from the **Sliders** button) — that advanced panel is still there.

---

## 4. How to verify (checklist)

Load the app and visually confirm each item:

- [ ] App loads and the point cloud renders normally (no regressions).
- [ ] **XYZ axis indicator** is in the **bottom-left** corner.
- [ ] There is **no stray gray dot in the top-right** corner.
- [ ] **Minimap** is in the **bottom-right** corner.
- [ ] Opening the **section/clip tool** shows a global **on/off toggle**; toggling it off hides the cut but **keeps the boxes**; toggling on restores the cut.
- [ ] The **default section box stays inside the viewport** (it is shorter than before).
- [ ] Opening the **right sidebar** does **not** cover the **top toolbar** — the toolbar remains fully visible.
- [ ] The sidebar has a **chevron toggle on its edge** that opens/closes it.
- [ ] A **gear button** in the toolbar opens a **quick-settings popover** with panoramas/minimap toggles, color mode, and point size.
- [ ] The **Sliders button** still opens the advanced **Rendering Settings** modal.

---

## 5. Troubleshooting

- **Styles look off / unstyled controls.** Make sure the app still imports the viewer's **theme CSS** the same way it did before the upgrade (the theme stylesheet must be imported once in the app). Missing CSS shows up as unstyled or mispositioned chrome, not as missing functionality.
- **The old version still loads after upgrading.** The git dependency was **not actually re-resolved**. Clear the lockfile entry for `@der-ort/pano-cloud-viewer` **and** delete `node_modules/@der-ort/pano-cloud-viewer`, then reinstall (Step 1b). Git dependencies cache the resolved commit; a plain `install` will keep using the pinned SHA until it is cleared.
- **Confirm the resolved commit changed.** After reinstalling, re-check the lockfile's `resolved` / `commit` field for this dependency — it should reference a newer commit than before. If it's unchanged, the resolution is still stale.
