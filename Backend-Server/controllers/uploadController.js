const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const { AssemblyAI } = require('assemblyai');
const path = require('path');

const uploadDirectory = './uploads';
const textDirectory = './text_files';

// Function to get options for text-to-speech
function getTTSOptions(text, languageData) {
  return {
    method: 'POST',
    url: 'https://realistic-text-to-speech.p.rapidapi.com/v3/generate_voice_over_v2',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.GENERATE_VOICE_OVER_RAPID_API,
      'X-RapidAPI-Host': 'realistic-text-to-speech.p.rapidapi.com'
    },
    data: {
      voice_obj: {
        id: 2045,
        voice_id: languageData.voice_id,
        gender: 'Male',
        language_code: languageData.language_code,
        language_name: languageData.language_name,
        status: 2,
        rank: 0,
        type: 'google_tts',
        isPlaying: false
      },
      json_data: [
        {
          block_index: 0,
          text: text
        }
      ]
    }
  };
}

// Function to translate text using RapidAPI
const translateTextRapidAPI = async (text, languageData) => {
  const options = {
    method: 'POST',
    url: 'https://microsoft-translator-text-api3.p.rapidapi.com/translate',
    params: {
      to: languageData.iso_code,
      from: 'en',
      textType: 'plain'
    },
    headers: {
      'x-rapidapi-key': process.env.TRANSLATE_TEXT_RAPID_API,
      'x-rapidapi-host': 'microsoft-translator-text-api3.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: [
      {
        text: text
      }
    ]
  };

  try {
    const response = await axios.request(options);

    // Extract the translated text
    const translations = response.data[0]?.translations || [];
    if (translations.length > 0) {
      return translations[0].text;
    } else {
      console.error('No translations found in response.');
      return null;
    }
  } catch (error) {
    console.error('Translation API Error:', error.response?.data || error.message);
    return null;
  }
};

const uploadController = async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      console.error('No audio file uploaded.');
      return res.status(400).send('No audio file uploaded.');
    }

    const assemblyaiClient = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    });

    const audioFile = req.files.audio;
    const tempFilePath = path.join(uploadDirectory, audioFile.name);

    const languageData = req.body.language ? JSON.parse(req.body.language) : {};

    // Move uploaded audio file to the designated directory
    audioFile.mv(tempFilePath, async (err) => {
      if (err) {
        console.error('Error moving uploaded file:', err);
        return res.status(500).send(err);
      }

      console.log('Uploaded file moved successfully:', tempFilePath);

      const data = {
        audio_url: tempFilePath
      };

      try {
        // Transcribe the audio file
        const transcript = await assemblyaiClient.transcripts.create(data);
        console.log('Transcription completed:', transcript.text);

        const textFilePath = path.join(textDirectory, `${path.parse(audioFile.name).name}.txt`);
        fs.writeFileSync(textFilePath, transcript.text);

        console.log('Transcription saved to:', textFilePath);

        const originalText = fs.readFileSync(textFilePath, 'utf8');
        const translatedText = await translateTextRapidAPI(originalText, languageData);

        if (translatedText) {
          const translatedTextFilePath = path.join(
            textDirectory,
            `${path.parse(audioFile.name).name}_Translated.txt`
          );
          fs.writeFileSync(translatedTextFilePath, translatedText);
          console.log('Translated text saved to:', translatedTextFilePath);

          const translatedAudioFilePath = path.join(
            uploadDirectory,
            `${path.parse(audioFile.name).name}_Translated.mp3`
          );

          const ttsOptions = getTTSOptions(translatedText, languageData);

          try {
            const ttsResponse = await axios.request(ttsOptions);
            const audioLink = ttsResponse.data[0].link;
            const audioResponse = await axios.get(audioLink, { responseType: 'arraybuffer' });
            fs.writeFileSync(translatedAudioFilePath, audioResponse.data);
            console.log('Translated audio saved successfully:', translatedAudioFilePath);

            // Send the translated audio file back to the client
            res.setHeader('Content-Type', 'audio/mpeg');
            res.sendFile(path.resolve(translatedAudioFilePath));
          } catch (error) {
            console.error('Error generating text-to-speech:', error);
            res.status(500).send('Error generating text-to-speech.');
          }
        } else {
          console.log('Translation failed.');
          res.status(500).send('Translation failed.');
        }
      } catch (transcriptionError) {
        console.error('Error transcribing audio:', transcriptionError);
        res.status(500).send(transcriptionError);
      }
    });
  } catch (error) {
    console.error('Error in uploadController:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadController };
