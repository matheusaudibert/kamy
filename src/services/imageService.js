
const { exec } = require('child_process');
const path = require('path');

exports.getDominantColor = (imageUrl) => {
    return new Promise((resolve, reject) => {
        exec(`python ${path.join(__dirname, '../../scripts/dominantColor.py')} ${imageUrl}`, (err, stdout, stderr) => {
            if (err || stderr) {
                console.error('Error executing Python script:', err || stderr);
                reject(err || stderr);
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

exports.generateAvatarImage = (avatarUrl, decorationUrl) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../scripts/avatarDeco.py');
        const command = decorationUrl
            ? `python ${scriptPath} ${avatarUrl} ${decorationUrl}`
            : `python ${scriptPath} ${avatarUrl}`;

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing Python script:', err);
                reject(err);
            } else {
                resolve(stdout.trim().split('\n').pop());
            }
        });
    });
};