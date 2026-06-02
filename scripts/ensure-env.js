const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');

function copyIfMissing(exampleRel, targetRel) {
  const example = path.join(root, exampleRel);
  const target = path.join(root, targetRel);
  if (fs.existsSync(target)) return false;
  if (!fs.existsSync(example)) {
    console.error(`Missing ${exampleRel}`);
    process.exit(1);
  }
  fs.copyFileSync(example, target);
  console.log(`Created ${targetRel} from ${exampleRel}`);
  return true;
}

const createdServer = copyIfMissing('server/.env.example', 'server/.env');
copyIfMissing('client/.env.example', 'client/.env');

if (createdServer) {
  const envPath = path.join(root, 'server', '.env');
  let text = fs.readFileSync(envPath, 'utf8');
  const localUri = 'MONGODB_URI=mongodb://127.0.0.1:27017/project-management';
  if (/^\s*MONGODB_URI\s*=/m.test(text)) {
    text = text.replace(/^\s*MONGODB_URI\s*=.*$/m, localUri);
  } else {
    text = `${localUri}\n${text}`;
  }
  if (!/JWT_SECRET=.+/.test(text) || /change_this/i.test(text)) {
    const secret = crypto.randomBytes(32).toString('hex');
    text = text.replace(
      /^JWT_SECRET=.*$/m,
      `JWT_SECRET=${secret}`
    );
  }
  fs.writeFileSync(envPath, text);
  console.log('Configured server/.env for local MongoDB and generated JWT_SECRET');
}
