// Keep 1080p masters in out/; export smaller, equally smooth website copies.
import {spawnSync} from 'node:child_process';
import {existsSync, renameSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(root, '../../studio/assets/website-story');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
for (const name of ['get-found', 'answers', 'build-trust']) {
  const source = path.join(root, 'out', `${name}-loop.mp4`);
  if (!existsSync(source)) throw new Error(`Render the ${name} master first.`);
  const temporary = path.join(target, `${name}.tmp.mp4`);
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-vf', 'scale=720:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-an', '-movflags', '+faststart', temporary], {stdio: 'inherit', windowsHide: true});
  if (result.error || result.status !== 0) {
    rmSync(temporary, {force: true});
    throw result.error || new Error(`Could not export ${name}.`);
  }
  renameSync(temporary, path.join(target, `${name}.mp4`));
  console.log(`Exported ${name}: 720 × 720, original 60 fps and duration.`);
}
