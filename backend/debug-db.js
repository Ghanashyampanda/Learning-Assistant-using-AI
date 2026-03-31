import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined');

if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Extract hostname from URI properly
// URI format: mongodb+srv://<user>:<password>@<hostname>/...
const match = uri.match(/@([^/?]+)/);
const hostname = match ? match[1] : null;

if (hostname) {
    console.log(`Attempting to resolve SRV record for: _mongodb._tcp.${hostname}`);
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
        if (err) {
            console.error('Default DNS SRV Resolution Error:', err.code);
            console.log('Retrying with Google DNS (8.8.8.8)...');

            // Try Google DNS
            dns.setServers(['8.8.8.8']);
            dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err2, addresses2) => {
                if (err2) {
                    console.error('Google DNS SRV Resolution Error:', err2.code);
                    console.log('\n--- DIAGNOSIS ---');
                    console.log('1. If "ETIMEOUT", your network/firewall is blocking DNS queries.');
                    console.log('2. If "ENOTFOUND", the hostname is wrong.');
                    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas Network Access.');
                } else {
                    console.log('Google DNS SRV Record Resolved:', addresses2);
                    console.log('SUCCESS! It seems your local DNS is the problem. Try changing your system DNS to 8.8.8.8.');
                }
            });
        } else {
            console.log('DNS SRV Record Resolved:', addresses);
        }
    });
} else {
    console.log('Could not extract hostname from URI, skipping DNS SRV check.');
}

console.log('Attempting Mongoose connection...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Mongoose Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Mongoose Connection Error:', err.message);
        process.exit(1);
    });

