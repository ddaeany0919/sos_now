const fs = require('fs');
const iconv = require('iconv-lite');
const path = require('path');

const filePath = path.join('public', '동물_동물병원.csv');
const buffer = fs.readFileSync(filePath);
const decoded = iconv.decode(buffer, 'euc-kr');

const firstLine = decoded.split('\n')[0];
const headers = firstLine.split(',');
console.log('Headers List:', JSON.stringify(headers, null, 2));
