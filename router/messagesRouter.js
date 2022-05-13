// messagesRouter.js
const connection = require("../db.js");
const mysql = require("mysql");
const express = require("express");
const { detectLanguage, translateText, } = require("../utils/translateFunctions.js");
const { LANGUAGE_ISO_CODE } = require("../utils/dictionaries.js");


const buildInsertQueryString = ( messageContent,languageContent, translatedContent) => {
    const queryString = `INSERT INTO translate ( messageContent,languageContent, translatedContent) 
    values ( ${mysql.escape(messageContent)}, ${mysql.escape(languageContent)}, ${mysql.escape(translatedContent)})`;
    return queryString;
};

const router = express.Router();

router.get("/", (req, res) => {
    connection.query("SELECT * FROM translate", (err, results) => {
        if (err) {
            console.log(err);
            return res.send(err);
        }
  
        return res.json({
            messages: results,
        })
    })
  });

router.post("/translate", async (req, res) => {
    const { messageContent, language} =
        req.body;
        
    if (!messageContent || !language) {
        return res.status(400).send("Bad request. Missing parametres.");
    }
    translationData= {
        translatedText: null
        }

        try {
            if (language === "ALL") {
                const originalLanguageResponse = await detectLanguage(messageContent);
                translationData.originalLanguage = originalLanguageResponse[0]?.language;
                const availableLanguages = Object.values(LANGUAGE_ISO_CODE);
    
                const translatedAnswersArray = await Promise.all(
                    availableLanguages.map(async (language) => {
                        const translatedTextResponse = await translateText(messageContent, language);
                        return translatedTextResponse[0];
                    })
                );
                translationData.translatedText = translatedAnswersArray.reduce(
                    (acc, curr) => {
                        return acc + curr + "\n";
                    },
                    ""
                );

            }
            else if (LANGUAGE_ISO_CODE[language]) {
                const originalLanguageResponse = await detectLanguage(messageContent);
                translationData.originalLanguage = originalLanguageResponse[0]?.language;
    
                const translatedTextResponse = await translateText(
                    messageContent,
                    LANGUAGE_ISO_CODE[language]
                );
                translationData.translatedText = translatedTextResponse[0];
            }
            else {
                return res.send("Language not supported");
            }

        const queryString = buildInsertQueryString(messageContent,language,translationData.translatedText);

        console.log(translationData.translatedText);
        connection.query(queryString, (err, results) => {

            if (err) {
                return res.send(err);
            }

            return res.json({
                data: results,
                translationData,
            });
          
        });
        
    } catch (err) {
        console.log(err);
        return res.send("Something went wrong");
    }
});

module.exports = router;
