//create vapid keys and save to file
import webPush from 'web-push';

//generate vapid keys
const vapidKeys = webPush.generateVAPIDKeys();

//write vapid keys to file
import fs from 'fs';

//write public key to file
fs.writeFileSync('./vapid_public_key.txt', vapidKeys.publicKey);

//write private key to file
fs.writeFileSync('./vapid_private_key.txt', vapidKeys.privateKey);

//log vapid keys
console.log('VAPID keys generated:');
console.log('Public Key: ', vapidKeys.publicKey);
console.log('Private Key: ', vapidKeys.privateKey);
