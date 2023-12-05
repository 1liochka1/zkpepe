import axios from "axios";


const HEADERS =  {
    'authority': 'www.zksyncpepe.com',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'ru,en;q=0.9',
        'referer': 'https://www.zksyncpepe.com/airdrop',
        'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "YaBrowser";v="23"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.686 YaBrowser/23.9.5.686 Yowser/2.5 Safari/537.36'
}
async function getAmount(address){
    try {
        const response = await axios.get(`https://www.zksyncpepe.com/resources/amounts/${address.toLowerCase()}.json`, {headers: HEADERS});
        if (response.status === 200) {
            if (response.data.toString().includes('!DOCTYPE')) {
                console.log(`${address} нечего клеймить`)
                return false
            }
            console.log(`${address} - успешно получил ${response.data} zkmeme доступных для клейма`)
            return Number(response.data);
        } else {
            console.log(`${address} - ошибка при отправке запроса - ${response.data}`)
            return false
        }
    } catch (e) {
        console.log(`${address} - ошибка при получении амаунт для клейма - ${e}...`)
        return false
    }
}

export async function getProof(address) {
    const amount = await getAmount(address);
    if (!amount) {
        return false
    }
    try {
        const response = await axios.get(`https://www.zksyncpepe.com/resources/proofs/${address.toLowerCase()}.json`, {headers: HEADERS});
        if (response.status === 200) {
            if (response.data.toString().includes('!DOCTYPE')) {
                console.log(`${address} - нечего клеймить`)
                return false
            }
            console.log(`${address} - успешно получил пруф для клейма`)
            return [response.data, amount];
        } else {
            console.log(`${address} - ошибка при отправке запроса - ${response.data}`)
            return false
        }
    } catch (e) {
        console.log(`${address} - ошибка при получении пруфа для клейма - ${e}...`)
        return false
    }
}

