async function check() {
    try {
        const response = await fetch('http://localhost:3000/api/debug/check-hospital-aeds');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

check();
