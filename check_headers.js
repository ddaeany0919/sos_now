const fs = require('fs');
const iconv = require('iconv-lite');
try {
    const buffer = fs.readFileSync('public/동물_동물병원.csv');
    // Try EUC-KR
    const decoded = iconv.decode(buffer, 'euc-kr');
    console.log(decoded.substring(0, 400));
} catch (e) {
    console.error(e);
}
