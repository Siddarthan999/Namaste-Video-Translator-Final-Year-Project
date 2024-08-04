const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const { AssemblyAI } = require('assemblyai');
const path = require('path');

const uploadDirectory = './uploads'; // Directory for uploaded files
const textDirectory = './text_files'; // Directory for text files

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
        voice_id: languageData.voice_id, // Use voice_id from language data
        gender: 'Male',
        language_code: languageData.language_code, // Use language_code from language data
        language_name: languageData.language_name, // Use language_name from language data
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

// Function to translate text
const translateText = async (text, languageData) => {
  const options = {
    method: 'POST',
    url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
    params: {
      'to[0]': languageData.iso_code, // Use iso_code from language data
      'api-version': '3.0',
      profanityAction: 'NoAction',
      textType: 'plain'
    },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.TRANSLATE_TEXT_RAPID_API,
      'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
    },
    data: [
      {
        Text: text
      }
    ]
  };

  try {
    const response = await axios.request(options);
    return response.data[0].translations[0].text; // Extract translated text
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
};

// Function to replace audio in video
function replaceAudioInVideo(inputVideoPath, translatedAudioPath, translatedVideoPath) {
  // Check if the translated video file already exists, if yes, delete it
  if (fs.existsSync(translatedVideoPath)) {
    console.log('Deleting existing translated video file...');
    fs.unlinkSync(translatedVideoPath);
  }

  // Construct and execute the FFmpeg command to replace the audio in the video
  const ffmpegCommand = `ffmpeg -i "${inputVideoPath}" -i "${translatedAudioPath}" -vcodec copy -acodec copy -map 0:0 -map 1:0 "${translatedVideoPath}"`;

  console.log('Replacing audio in video...');

  // Execute the FFmpeg command
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error replacing audio in video:', error);
      return;
    }

    console.log('Audio replaced in video:', translatedVideoPath);
    console.log('Replacement completed successfully.');
  });
}

const uploadController = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      console.error('No video file uploaded.');
      return res.status(400).send('No video file uploaded.');
    }

    const assemblyaiClient = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    });

    const videoFile = req.files.video;
    const tempFilePath = path.join(uploadDirectory, videoFile.name);
    const audioFilePath = path.join(uploadDirectory, `${path.parse(videoFile.name).name}.mp3`);

    // Extract language data from the request body
    const languageData = req.body.language ? JSON.parse(req.body.language) : {};

    // Check if the audio file already exists
    if (fs.existsSync(audioFilePath)) {
      console.log('Audio file already exists. Deleting...');
      fs.unlinkSync(audioFilePath); // Delete the existing audio file
    }

    // Move the uploaded video file to a temporary location
    videoFile.mv(tempFilePath, async (err) => {
      if (err) {
        console.error('Error moving uploaded file:', err);
        return res.status(500).send(err);
      }

      console.log('Uploaded file moved successfully:', tempFilePath);

      // Extract audio using FFmpeg
      const ffmpegCommand = `ffmpeg -i ${tempFilePath} -vn -acodec libmp3lame -q:a 2 ${audioFilePath}`;

      exec(ffmpegCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error('Error extracting audio:', error);
          return res.status(500).send(error);
        }

        console.log('Audio extraction completed:', audioFilePath);

        // Transcribe audio using AssemblyAI
        const data = {
          audio_url: audioFilePath
        };

        try {
          const transcript = await assemblyaiClient.transcripts.create(data);
          console.log(transcript.text);

          // Create the output directory if it doesn't exist
          if (!fs.existsSync(textDirectory)) {
            fs.mkdirSync(textDirectory);
            console.log('Output directory created:', textDirectory);
          }

          // Write transcription to a text file
          const textFilePath = path.join(textDirectory, `${path.parse(videoFile.name).name}.txt`);
          fs.writeFileSync(textFilePath, transcript.text);

          console.log('Transcription saved to:', textFilePath);

          // Send the path of the saved text file as a response
          res.json({ transcriptionPath: textFilePath });

          // Translate and process the text
          try {
            const filePath = path.join(textDirectory, `${path.parse(videoFile.name).name}_Translated.txt`);
            const transfilePath = path.join(uploadDirectory, `${path.parse(videoFile.name).name}_Translated.mp3`);

            const transText = fs.readFileSync(textFilePath, 'utf8');
            const translatedText = await translateText(transText, languageData);

            if (translatedText) {
              fs.writeFile(filePath, translatedText, async (err) => {
                if (err) {
                  console.error('Error writing file:', err);
                  return;
                }
                console.log('Translated text saved to:', filePath);

                const transOptions = getTTSOptions(translatedText, languageData);

                // Send request for text-to-speech
                try {
                  const transResponse = await axios.request(transOptions);
                  const mp3Link = transResponse.data[0].link;
                  const mp3Response = await axios.get(mp3Link, { responseType: 'arraybuffer' });
                  fs.writeFileSync(transfilePath, mp3Response.data);
                  console.log('Output MP3 file saved successfully!');

                  const inputVideoPath = path.join(uploadDirectory, videoFile.name);
                  const translatedAudioPath = transfilePath;
                  const translatedVideoPath = path.join(uploadDirectory, 'translated_video.mp4');

                  replaceAudioInVideo(inputVideoPath, translatedAudioPath, translatedVideoPath);
                } catch (error) {
                  console.error('Error processing text to speech:', error);
                }
              });
            } else {
              console.log('Translation failed.');
            }
          } catch (error) {
            console.error('Error translating text:', error);
          }
        } catch (transcriptionError) {
          console.error('Error transcribing audio:', transcriptionError);
          res.status(500).send(transcriptionError);
        }
      });
    });
  } catch (error) {
    console.error('Error in uploadController:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadController };
