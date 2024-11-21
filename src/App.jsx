import { useRef, useState } from 'react'
import './App.css'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

function App() {
  const [upload, setUpload] = useState(false)
  const [file, setFile] = useState(null);
  const [laoded, setLoaded] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());

  const onUpload = (event) => {
    setFile(event.target.files[0]);  
    setUpload(true);
  }

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on("log", ({ message }) => {
      // if (messageRef.current) messageRef.current.innerHTML = messageRef.current.innerHTML + " >>> " + message;
      console.log("FFmpeg log: ", message)
    });


    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    console.log("in load")


    setLoaded(true)
  }

  return upload ? (
    <>
      <div>
        <video src={`${URL.createObjectURL(file)}`} width={480} controls></video>
        <button onClick={load}>Load FFMPEG</button>

        {laoded && <video src="input.mp4" width={480} controls></video>}
      </div>
    </>
  ) : <>
    <input type='file' onChange={(event) => onUpload(event)}></input>
  </>
}

export default App
