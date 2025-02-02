// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

import notifier from 'node-notifier';
import clipboardy from 'clipboardy';
import open from 'open';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./config.json'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const starCountRef = ref(database, 'hewkawdrop/');

onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
        return;
    }

    const result = Object.entries(data).map(([name, data]) => ({
        name,
        ...data
    }));

    const last = result.pop();

    if (!last) {
        return;
    }

    const time = new Date(last.value.time);

    if (time.getTime() + 1000 * 5 < Date.now()) {
        return;
    }

    console.log(`[${time.toLocaleString()}] ${last.value.sender}: ${last.value.data}`);
    

    if (last.value.data.startsWith('https://')) {
        notifier.notify({
            title: "HewkawDrop",
            icon: "./airdrop.svg",
            message: `Sender: ${last.value.sender}`,
        });

        open(last.value.data);

        return;
    } else {
        notifier.notify({
            title: "HewkawDrop",
            icon: "./airdrop.svg",
            message: last.value.data,
            actions: ["Copy to Clipboard"],
        }, function (err, response, metadata) {
            if (metadata.activationType === "Copy to Clipboard") {
                clipboardy.writeSync(last.value.data);
            }
        });

        return;
    }
});

console.log('Listening for HewkawDrop...');