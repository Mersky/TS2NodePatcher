const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const patchName = process.argv[2] || 'mainClient'
const folderPath = './Patch';
const jsonFilePath = patchName + '.json';
const cyrptedHash = process.argv[3] || 'md5';

function calculateHash(filePath) {
    const fileData = fs.readFileSync(filePath);
    const hash = crypto.createHash(cyrptedHash).update(fileData).digest('hex');
    return hash;
}

function generateFileHashesRecursive(folderPath) {
    const fileHashes = {};

    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            // Eğer bir klasörse, rekurisif olarak çağır
            const nestedFolderHashes = generateFileHashesRecursive(filePath);
            Object.assign(fileHashes, nestedFolderHashes);
        } else {
            // Eğer bir dosyaysa, hash değerini hesapla ve JSON objesine ekle
            const hash = calculateHash(filePath);
            const normalizedPath = normalizeFilePath(filePath);
            fileHashes[normalizedPath] = hash;
        }
    });

    return fileHashes;
}

function normalizeFilePath(filePath) {
    // "Patch" klasörünü sil ve "\\"'yi "\"'ye dönüştür
    return filePath.replace(/^[\\\/]?Patch[\\\/]/i, '\\' + patchName + '\\')
}


function generateFileHashesAndWriteToFile() {
    const fileHashes = generateFileHashesRecursive(folderPath);

    // JSON dosyasına yazılıyor
    fs.writeFileSync(jsonFilePath, JSON.stringify(fileHashes, null, 2));

    console.log('"' + cyrptedHash + '" Hash değerleri JSON dosyasına yazıldı:', jsonFilePath);
}

// Dosya hash'lerini oluştur ve JSON dosyasına yaz
generateFileHashesAndWriteToFile();
