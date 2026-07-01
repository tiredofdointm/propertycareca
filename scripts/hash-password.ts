import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash-password -- <plaintext-password>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log(hash);
  console.log(
    "\nAdd to .env.local as ADMIN_PASSWORD_HASH, escaping every $ as \\$ " +
      "(Next.js expands unescaped $vars in .env files):"
  );
  console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
});
