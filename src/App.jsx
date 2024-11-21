import { useRef, useState } from 'react'
import './App.css'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

function App() {
  const [upload, setUpload] = useState(false)
  const [file, setFile] = useState(null);
  const [laoded, setLoaded] = useState(false);
  const [transcoded, setTranscoded] = useState(false);
  const [output, setOutput] = useState(null)

  const ffmpegRef = useRef(new FFmpeg());

  const onUpload = (event) => {
    setFile(event.target.files[0]);
    setUpload(true);
  }

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on("log", ({ type, message }) => {
      // if (messageRef.current) messageRef.current.innerHTML = messageRef.current.innerHTML + " >>> " + message;
      console.log("FFmpeg: ",type, message)
    });

    
    // await ffmpeg.load({
    //   coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    //   wasmURL: await toBlobURL(
    //     `${baseURL}/ffmpeg-core.wasm`,
    //     "application/wasm"
    //   ),
    //   workerURL: await toBlobURL(
    //     `${baseURL}/ffmpeg-core.worker.js`,
    //     "text/javascript"
    //   ),
    // });

    await ffmpeg.load({ coreURL, wasmURL });

    console.log("in load")
    setLoaded(true)
  }

  const transcode = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
  
      // Write the input file to FFmpeg's virtual filesystem
      await ffmpeg.writeFile("in.mp4", await fetchFile(URL.createObjectURL(file)));
      console.log("File written to FFmpeg's virtual filesystem");
  
      // Execute the FFmpeg command for .mp4 to .gif conversion
      await ffmpeg.exec(["-i", "in.mp4", "-ss", "5", "-t", "2", "-loop", "0", "-filter_complex", "fps=10, scale=-1:360[s]; [s]split[a][b]; [a]palettegen[palette]; [b][palette]paletteuse", "out.gif"]);
      console.log("FFmpeg command executed");
  
      // Read the output GIF file from the virtual filesystem
      const data = await ffmpeg.readFile("out.gif");
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "image/gif" })
      );
  
      // Update the state to show the generated GIF
      console.log("GIF generated successfully");
      setOutput(url);
      setTranscoded(true);
    } catch (err) {
      console.error("Error during transcoding:", err);
    }
  };
  
  

  return upload ? (
    <>
      <div>
        <video src={`${URL.createObjectURL(file)}`} width={480} controls></video>
        <button onClick={load}>Load FFMPEG</button>

        {laoded && <div>
          <video src="input.mp4" width={480} controls></video>
          <button onClick={transcode}>Transcode</button>
        </div>}
        {transcoded && <div>
          <p>{output} </p>
          <img src={output}></img>
        </div>}
      </div>
    </>
  ) : <>
    <input type='file' onChange={(event) => onUpload(event)}></input>
  </>
}

export default App
