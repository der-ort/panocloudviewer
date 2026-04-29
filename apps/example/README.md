# PanoCloudViewer Example

Standalone example project using `@der-ort/pano-cloud-viewer`.

## Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Point Cloud Data

Place your Potree 2.0 files in `public/sample/`:

```
public/sample/
├── metadata.json
├── hierarchy.bin
├── octree.bin
└── cameras.json    (optional — for panorama markers)
```

Or set `NEXT_PUBLIC_POINTCLOUD_URL` in `.env.local` to load from a remote URL:

```
NEXT_PUBLIC_POINTCLOUD_URL=https://your-bucket.s3.amazonaws.com/project/
```

## Using a published package

To use the npm-published version instead of the local link, change `package.json`:

```diff
- "@der-ort/pano-cloud-viewer": "file:../PanoCloudViewer/packages/viewer",
+ "@der-ort/pano-cloud-viewer": "^0.1.0",
```
