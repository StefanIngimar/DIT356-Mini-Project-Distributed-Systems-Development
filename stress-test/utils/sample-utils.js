export function randomId (length=6) {
    return Math.random().toString(36).substring(2, length+2);
};

export function randomString(length=7) {
    const charset = 'abcdefghijklmnopqrstuvwxyz';
    let res = '';
    while (length--) res += charset[Math.random() * charset.length | 0];
    return res;
}

export function randomIntBetween (min=0, max=9) {
    min = Math.ceil(min)
    max = Math.floor(max)
  
    return Math.floor(Math.random() * (max - min + 1) + min) 
}

export function randomItem(arrayOfItems){
    return arrayOfItems[Math.floor(Math.random() * arrayOfItems.length)];
}

export const tlds = ["com", "se", "org", "edu", "app", "net", "io", "info", "tech", "biz"];

// https://jslib.k6.io/k6-utils/1.1.0/index.js