// Uploads the hero scroll-sequence frames to Cloudinary.
//
//   node --env-file=.env.local scripts/upload-frames-cloudinary.mjs [--dir <path>] [--one]
//
// Re-runs are safe: public IDs are fixed and existing assets are not overwritten.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

const FOLDER = 'perfume-demo/frames';
const CONCURRENCY = 6;

const args = process.argv.slice(2);
const dirFlag = args.indexOf('--dir');
const sourceDir = dirFlag !== -1 ? args[dirFlag + 1] : 'public/perfume/images-seq';
const onlyOne = args.includes('--one');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_* variables. Run with --env-file=.env.local');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// ezgif-frame-001.webp -> frame-001
const publicIdFor = (file) => {
  const num = file.match(/(\d+)\.webp$/)[1].padStart(3, '0');
  return `${FOLDER}/frame-${num}`;
};

const files = (await readdir(sourceDir)).filter((f) => f.endsWith('.webp')).sort();
const queue = onlyOne ? files.slice(0, 1) : [...files];
const total = queue.length;
console.log(`Uploading ${total} frame(s) from ${sourceDir} to ${FOLDER}`);

let done = 0;
const failures = [];

const uploadOne = async (file) => {
  const publicId = publicIdFor(file);
  try {
    const res = await cloudinary.uploader.upload(path.join(sourceDir, file), {
      // Setting the full public_id (and asset_folder) gives the same delivery URL
      // whether the account uses fixed or dynamic folders.
      public_id: publicId,
      asset_folder: FOLDER,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
      resource_type: 'image',
    });
    done++;
    if (onlyOne) console.log({ public_id: res.public_id, secure_url: res.secure_url, existing: res.existing });
    else if (done % 20 === 0 || done === total) console.log(`  ${done}/${total}`);
  } catch (err) {
    failures.push({ file, error: err.message ?? err.error?.message ?? String(err) });
  }
};

const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await uploadOne(queue.shift());
});
await Promise.all(workers);

if (failures.length) {
  console.error(`${failures.length} upload(s) failed:`);
  for (const f of failures) console.error(`  ${f.file}: ${f.error}`);
  process.exit(1);
}
console.log('Done.');
