const {Translate} = require('@google-cloud/translate').v2;

const translateAPI = new Translate();

async function detectLanguage(inputText){
    const languageDetection = await translateAPI.detect(inputText);
    console.log(languageDetection);
    return languageDetection;
}

async function translateText(inputText, targetLanguage){
    const outputText = await translateAPI.translate(inputText, targetLanguage);
    console.log(outputText);
    return outputText;
}

module.exports = {
    detectLanguage,
    translateText
}