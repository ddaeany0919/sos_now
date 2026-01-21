const ENCODED_KEY = '1LzH1VYMNnqzGqD05xDYYVJxJY%2F5LHSKsZY9dSONrit7zBAKqW3vO3v3thvd7yCHDQW60SXEmwoNaDtaVbLWzQ%3D%3D';
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser();

async function test(name, url) {
    console.log(`\n[${name}]`);
    try {
        const res = await fetch(url);
        const text = await res.text();
        const result = parser.parse(text);
        const item = result.response?.body?.items?.item;
        const firstItem = Array.isArray(item) ? item[0] : item;
        console.log(JSON.stringify(firstItem, null, 2));
    } catch (e) { console.log('Error:', e.message); }
}

async function run() {
    const q0 = encodeURIComponent('서울특별시');
    await test('Pharmacy', `http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire?serviceKey=${ENCODED_KEY}&Q0=${q0}&numOfRows=1`);
    await test('AED', `http://apis.data.go.kr/B552657/AEDInfoInqireService/getAedLcinfoInqire?serviceKey=${ENCODED_KEY}&Q0=${q0}&numOfRows=1`);
}

run();
