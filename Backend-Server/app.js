require('dotenv').config();
const express = require('express');
const  cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const { AssemblyAI } = require('assemblyai');
const path = require('path');
const app = express()
const PORT  = process.env.PORT;

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

const mongoose = require('mongoose')

// Use CORS middleware
const cors = require('cors');
app.use(cors());

app.get('/', (request, response) => {
    response.status(200).json({message:'Hello World!'});
})

const loginRoute = require('./routes/loginRoute')
app.use('/login', loginRoute)

const signupRoute = require('./routes/signupRoute')
app.use('/signup', signupRoute)


mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.once('open', () => console.log(`Connected to database successfully`))
db.on('error', (errorMessage) => console.log(errorMessage))



// SERVER.JS CODE FOR UPLOAD PROCESSING

const assemblyaiClient = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY
  });

const uploadDirectory = './uploads'; // Directory for uploaded files
const textDirectory = './text_files'; // Directory for text files

// Function to get options for text-to-speech
function getTTSOptions(text) {
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
        voice_id: 'hi-IN-Neural2-C',
        gender: 'Male',
        language_code: 'hi-IN',
        language_name: 'Hindi',
        voice_name: 'Rahul',
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

const translateText = async (text) => {
  const options = {
    method: 'POST',
    url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
    params: {
      'to[0]': 'ta', // Translate to Tamil
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

// Middleware
app.use(fileUpload());

// Route for uploading video
app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.video) {
    console.error('No video file uploaded.');
    return res.status(400).send('No video file uploaded.');
  }

  const videoFile = req.files.video;
  const tempFilePath = path.join(uploadDirectory, videoFile.name);
  const audioFilePath = path.join(uploadDirectory, `${path.parse(videoFile.name).name}.mp3`);

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
          const translatedText = await translateText(transText);

          if (translatedText) {
            fs.writeFile(filePath, translatedText, async (err) => {
              if (err) {
                console.error('Error writing file:', err);
                return;
              }
              console.log('Translated text saved to:', filePath);

              const transOptions = getTTSOptions(translatedText);

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
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})