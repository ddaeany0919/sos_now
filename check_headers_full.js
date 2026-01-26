const fs = require('fs');
const iconv = require('iconv-lite');
try {
    const buffer = fs.readFileSync('public/동물_동물병원.csv');
    const decoded = iconv.decode(buffer, 'euc-kr');
    const lines = decoded.split('\n');
    console.log(lines[0]); // Header
    console.log(lines[1]); // First row
} catch (e) {
    console.error(e);
}
