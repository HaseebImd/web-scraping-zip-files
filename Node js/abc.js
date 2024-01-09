const base_url = 'https://www.dafont.com/new.php?page='; // Base URL
const fpp = '&fpp=200&psize=s'; // Remaining part of the URL

for (let i = 1; i <= 10; i++) {
    const url = base_url + i + fpp;
    console.log(url); // Replace this with your desired operation using the generated URL
}
