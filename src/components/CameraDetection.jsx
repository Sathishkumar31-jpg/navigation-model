import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { motion } from "framer-motion";

const CameraDetection = ({ isActive, onStatusChange }) => {

const videoRef = useRef(null);
const canvasRef = useRef(null);

const [model,setModel] = useState(null);
const [loading,setLoading] = useState(false);

const streamRef = useRef(null);
const animationRef = useRef(null);
const lastSpeak = useRef("");

const supportedClasses = [

"person",
"chair",
"bottle",
"fan",
"table",
"tree",
"tv",
"laptop",
"motorcycle",
"bicycle",
"car",
"stick",
"knife",
"banana",
"apple",
"orange",
"carrot",
"slippers",
"toothbrush",
"clock",
"toilet",
"door",
"window",
"tomato",
"apple",
"cell phone"

];

const SPOKEN_NAMES = {
  "cell phone": "cell phone",
  "table": "table",
  "stick": "stick",
  "tv": "TV",
  "laptop": "laptop",
  "motorcycle": "motorcycle",
  "bicycle": "bicycle",
  "car": "car",
  "dress": "dress",
  "bottle": "bottle",
  "slippers": "slippers",
  "knife": "knife",
  "tree": "tree",
  "banana": "banana",
  "apple": "apple",
  "orange": "orange",
  "carrot": "carrot",
  "chair": "chair",
  "toilet": "toilet",
  "clock": "clock",
  "fan": "fan",
  "chairs": "chairs",
  "toothbrush": "toothbrush",
  "person": "person",
  "tomato": "tomato",
  "door": "door",
  "window": "window"
};

const speak = (text)=>{

if(!("speechSynthesis" in window)) return;

if(lastSpeak.current === text) return;

const utter = new SpeechSynthesisUtterance(text);

utter.rate = 1;
utter.pitch = 1;

window.speechSynthesis.cancel();
window.speechSynthesis.speak(utter);

lastSpeak.current = text;

};

useEffect(()=>{

const loadModel = async()=>{

setLoading(true);

await tf.ready();

const loadedModel = await cocossd.load();

setModel(loadedModel);

setLoading(false);

};

loadModel();

},[]);

useEffect(()=>{

if(!isActive || !model) return;

startCamera();

return stopCamera;

},[isActive,model]);

const startCamera = async()=>{

const stream = await navigator.mediaDevices.getUserMedia({

video:{ facingMode:"environment"}

});

streamRef.current = stream;

const video = videoRef.current;

video.srcObject = stream;

video.onloadedmetadata = async()=>{

await video.play();

resizeCanvas();

detectFrame();

};

};

const resizeCanvas = ()=>{

const video = videoRef.current;
const canvas = canvasRef.current;

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

};

const detectFrame = async()=>{

const video = videoRef.current;

if(video.readyState !== 4){

animationRef.current = requestAnimationFrame(detectFrame);
return;

}

const predictions = await model.detect(video);

drawBoxes(predictions);
processPredictions(predictions);

animationRef.current = requestAnimationFrame(detectFrame);

};

const drawBoxes = (predictions)=>{

const ctx = canvasRef.current.getContext("2d");

ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);

ctx.font="18px Arial";

predictions.forEach(p=>{

if(p.score < 0.5) return;

const [x,y,w,h] = p.bbox;

ctx.strokeStyle="cyan";
ctx.lineWidth=3;

ctx.strokeRect(x,y,w,h);

ctx.fillStyle="cyan";
ctx.fillRect(x,y-20,160,20);

ctx.fillStyle="black";
ctx.fillText(p.class,x+5,y-5);

});

};

const processPredictions = (predictions)=>{

if(predictions.length === 0) return;

const videoWidth = videoRef.current.videoWidth;

predictions.forEach(p=>{

if(p.score < 0.5) return;

if(!supportedClasses.includes(p.class)) return;

const [x,y,w,h] = p.bbox;

const center = x + w/2;

let position = "center";

if(center < videoWidth*0.33) position="left";
else if(center > videoWidth*0.66) position="right";

const spokenClass = SPOKEN_NAMES[p.class] || p.class;

const message = `${spokenClass} ${position}`;

speak(message);

onStatusChange?.(message);

});

};

const stopCamera = ()=>{

if(streamRef.current){

streamRef.current.getTracks().forEach(track=>track.stop());

}

if(animationRef.current){

cancelAnimationFrame(animationRef.current);

}

};

return(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
className={`relative w-full aspect-video ${!isActive && "hidden"}`}
>

{loading &&(

<div className="absolute inset-0 flex items-center justify-center bg-black/70">

<p className="text-white text-xl">Loading AI Model...</p>

</div>

)}

<video
ref={videoRef}
autoPlay
playsInline
muted
style={{width:"100%",height:"100%",objectFit:"cover"}}
/>

<canvas
ref={canvasRef}
style={{
position:"absolute",
top:0,
left:0,
width:"100%",
height:"100%"
}}
/>

</motion.div>

);

};

export default CameraDetection;









// import { useEffect, useRef, useState } from "react";
// import * as tf from "@tensorflow/tfjs";
// import * as cocossd from "@tensorflow-models/coco-ssd";
// import { motion } from "framer-motion";
// import { triggerVibration } from "./HapticFeedback";

// const CameraDetection = ({ isActive, onStatusChange }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [model, setModel] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [detectionStarted, setDetectionStarted] = useState(false);

//   const lastAlertTime = useRef(0);

//   const targetClasses = [
//     'person', 'chair', 'dining table', 'couch', 'bed', 'tv', 'laptop',
//     'motorcycle', 'bicycle', 'car', 'bus', 'truck', 'bottle', 'cup',
//     'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
//     'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut',
//     'cake', 'potted plant', 'vase', 'scissors', 'teddy bear',
//     'hair drier', 'toothbrush', 'sink', 'toilet', 'book', 'clock',
//     'door', 'window', 'stairs'
//   ];

//   const speak = (text) => {
//     if ("speechSynthesis" in window) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.rate = 0.8;
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   // LOAD MODEL
//   useEffect(() => {
//     const loadModel = async () => {
//       setLoading(true);
//       try {
//         await tf.ready();
//         const loadedModel = await cocossd.load();
//         setModel(loadedModel);
//         console.log("COCO-SSD loaded");
//       } catch (err) {
//         console.error("Model load error:", err);
//       }
//       setLoading(false);
//     };

//     loadModel();
//   }, []);

//   useEffect(() => {
//     let stream = null;
//     let reqId = null;

//     const startCamera = async () => {
//       if (!isActive || !model) return;

//       try {
//         onStatusChange?.("Starting camera...");

//         stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 1280 }, height: { ideal: 720 } },
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;

//           videoRef.current.setAttribute("playsinline", true);
//           videoRef.current.muted = true;

//           await videoRef.current.play();


//           videoRef.current.onloadedmetadata = () => {

//             const video = videoRef.current;
//             const canvas = canvasRef.current;

//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;

//             detectFrame();

//           };
//         }
//       } catch (err) {
//         console.error("Camera error:", err);
//         onStatusChange?.("Camera access failed");
//       }
//     };

//     const detectFrame = async () => {
//       if (!videoRef.current || !canvasRef.current || !model || !isActive)
//         return;

//       const video = videoRef.current;
//       console.log(video.videoWidth, video.videoHeight);

//       if (video.readyState !== 4) {
//         reqId = requestAnimationFrame(detectFrame);
//         return;
//       }

//       try {
//         const predictions = await model.detect(video);
//         renderPredictions(predictions);
//         processPredictions(predictions);
//       } catch (err) {
//         console.error("Detection error:", err);
//       }

//       if (isActive) {
//         reqId = requestAnimationFrame(detectFrame);
//       }
//     };

//     const renderPredictions = (predictions) => {
//       const ctx = canvasRef.current.getContext("2d");

//       ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//       ctx.font = "16px sans-serif";

//       predictions.forEach((p) => {
//         if (p.score < 0.3) return;

//         const [x, y, width, height] = p.bbox;

//         ctx.strokeStyle = "#00e0ff";
//         ctx.lineWidth = 3;
//         ctx.strokeRect(x, y, width, height);

//         ctx.fillStyle = "#00e0ff";
//         ctx.fillRect(x, y, 120, 20);

//         ctx.fillStyle = "black";
//         ctx.fillText(p.class, x + 4, y + 4);
//       });
//     };

//     const processPredictions = (predictions) => {
//       const now = Date.now();

//       if (now - lastAlertTime.current < 2000) return;

//       const videoWidth = videoRef.current.videoWidth;

//       let alerts = [];

//       predictions.forEach((p) => {
//         if (p.score < 0.4) return;

//         const [x, y, width, height] = p.bbox;

//         const area = width * height;
//         const distance = Math.round(10000 / Math.sqrt(area));

//         const center = x + width / 2;

//         let position = "center";

//         if (center < videoWidth * 0.3) position = "left";
//         else if (center > videoWidth * 0.7) position = "right";

//         alerts.push(`${p.class} ${position} distance ${distance} cm`);
//       });

//       if (alerts.length > 0) {
//         lastAlertTime.current = now;

//         const message = alerts.join(". ");

//         speak(message);
//         onStatusChange?.(message);

//         triggerVibration([200, 100, 200]);
//       }
//     };

//     if (isActive) {
//       startCamera();
//     }

//     return () => {
//       if (stream) stream.getTracks().forEach((t) => t.stop());
//       if (reqId) cancelAnimationFrame(reqId);
//     };
//   }, [isActive, model, detectionStarted, onStatusChange]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className={`relative w-full aspect-video rounded-3xl overflow-hidden ${!isActive && "hidden"
//         }`}
//     >
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
//           <p className="text-white text-xl font-bold">
//             Loading AI Vision Model...
//           </p>
//         </div>
//       )}

//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         className="absolute inset-0 w-full h-full object-cover z-0"
//       />

//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 w-full h-full z-10 pointer-events-none"
//       />
//     </motion.div>
//   );
// };

// export default CameraDetection;







// import { useEffect, useRef, useState } from "react";
// import * as tf from "@tensorflow/tfjs";
// import * as cocossd from "@tensorflow-models/coco-ssd";
// import { motion } from "framer-motion";
// import { triggerVibration } from "./HapticFeedback";

// const CameraDetection = ({ isActive, onStatusChange }) => {

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [model, setModel] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const animationRef = useRef(null);
//   const streamRef = useRef(null);
//   const lastAlertTime = useRef(0);

//   const targetClasses = [
//     "person","chair","dining table","couch","bed","tv","laptop",
//     "motorcycle","bicycle","car","bus","truck","bottle","cup",
//     "fork","knife","spoon","bowl","banana","apple","sandwich",
//     "orange","broccoli","carrot","hot dog","pizza","donut",
//     "cake","potted plant","vase","scissors","teddy bear",
//     "hair drier","toothbrush","sink","toilet","book","clock",
//     "door","window","stairs"
//   ];

//   const speak = (text) => {
//     if ("speechSynthesis" in window) {
//       const utter = new SpeechSynthesisUtterance(text);
//       utter.rate = 0.9;
//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(utter);
//     }
//   };

//   // Load AI model
//   useEffect(() => {

//     const loadModel = async () => {

//       try {

//         setLoading(true);

//         await tf.ready();
//         const loadedModel = await cocossd.load();

//         setModel(loadedModel);

//         console.log("Model Loaded");

//       } catch (err) {

//         console.error("Model error", err);

//       }

//       setLoading(false);

//     };

//     loadModel();

//   }, []);

//   // Start camera
//   useEffect(() => {

//     if (!isActive || !model) return;

//     startCamera();

//     return stopCamera;

//   }, [isActive, model]);

//   const startCamera = async () => {

//     try {

//       onStatusChange?.("Starting camera...");

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" }
//       });

//       streamRef.current = stream;

//       const video = videoRef.current;

//       video.srcObject = stream;
//       video.muted = true;
//       video.playsInline = true;

//       video.onloadedmetadata = async () => {

//         await video.play();

//         resizeCanvas();

//         detectFrame();

//       };

//     } catch (err) {

//       console.error("Camera error:", err);
//       onStatusChange?.("Camera failed");

//     }

//   };

//   const resizeCanvas = () => {

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//   };

//   const detectFrame = async () => {

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas || !model) return;

//     if (video.readyState !== 4) {

//       animationRef.current = requestAnimationFrame(detectFrame);
//       return;

//     }

//     const predictions = await model.detect(video);

//     drawBoxes(predictions);
//     processPredictions(predictions);

//     animationRef.current = requestAnimationFrame(detectFrame);

//   };

//   const drawBoxes = (predictions) => {

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.font = "18px Arial";
//     ctx.textBaseline = "top";

//     predictions.forEach(pred => {

//       if (pred.score < 0.4) return;

//       const [x, y, width, height] = pred.bbox;

//       ctx.strokeStyle = "#00FFFF";
//       ctx.lineWidth = 3;
//       ctx.strokeRect(x, y, width, height);

//       ctx.fillStyle = "#00FFFF";
//       ctx.fillRect(x, y - 22, 120, 22);

//       ctx.fillStyle = "black";
//       ctx.fillText(pred.class, x + 5, y - 20);

//     });

//   };

//   const processPredictions = (predictions) => {

//     const now = Date.now();

//     if (now - lastAlertTime.current < 2000) return;

//     const videoWidth = videoRef.current.videoWidth;

//     let alerts = [];

//     predictions.forEach(p => {

//       if (p.score < 0.5) return;
//       if (!targetClasses.includes(p.class)) return;

//       const [x, y, width, height] = p.bbox;

//       const area = width * height;
//       const distance = Math.round(9000 / Math.sqrt(area));

//       const center = x + width / 2;

//       let position = "center";

//       if (center < videoWidth * 0.33) position = "left";
//       else if (center > videoWidth * 0.66) position = "right";

//       alerts.push(`${p.class} ${position} ${distance} centimeters`);

//     });

//     if (alerts.length > 0) {

//       lastAlertTime.current = now;

//       const msg = alerts.join(". ");

//       speak(msg);
//       onStatusChange?.(msg);

//       triggerVibration([200,100,200]);

//     }

//   };

//   const stopCamera = () => {

//     if (streamRef.current) {

//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;

//     }

//     if (animationRef.current) {

//       cancelAnimationFrame(animationRef.current);

//     }

//   };

//   return (

//     <motion.div
//       initial={{opacity:0}}
//       animate={{opacity:1}}
//       className={`relative w-full aspect-video rounded-3xl overflow-hidden ${!isActive && "hidden"}`}
//     >

//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
//           <p className="text-white text-xl font-bold">
//             Loading AI Model...
//           </p>
//         </div>
//       )}

//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         style={{width:"100%", height:"100%", objectFit:"cover"}}
//       />

//       <canvas
//         ref={canvasRef}
//         style={{
//           position:"absolute",
//           top:0,
//           left:0,
//           width:"100%",
//           height:"100%",
//           pointerEvents:"none"
//         }}
//       />

//     </motion.div>
//   );

// };

// export default CameraDetection;











