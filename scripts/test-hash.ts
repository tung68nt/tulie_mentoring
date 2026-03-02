import bcrypt from "bcryptjs";

const password = "password123";
// The hash from viewer@tulie.vn or others
const hashes = [
    "$2b$12$9/pmduvV2aqgN6Cgp57GkOJcW6.xgVhPI8mo6O3H9YwsDO8oA5bz2", // the one I just saw in check-users output
];

async function main() {
    for (const h of hashes) {
        const match = await bcrypt.compare(password, h);
        console.log(`Hash: ${h} matches "${password}": ${match}`);
    }
}

main();
