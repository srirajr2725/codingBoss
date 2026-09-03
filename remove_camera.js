const fs = require('fs');
let code = fs.readFileSync('src/QuestionPage.js', 'utf8');

// Normalize newlines
code = code.replace(/\r\n/g, '\n');

// 1. Remove state and refs
code = code.replace(/  const \[cameraStream, setCameraStream\] = useState\(null\);\n  const \[isDetectionEnabled, setIsDetectionEnabled\] = useState\(true\);\s*\/\/ Default to true\n  const videoRef = useRef\(null\);\n  const canvasRef = useRef\(null\);\n/g, '');

// 2. Remove isCameraMinimized state
code = code.replace(/  const \[isCameraMinimized, setIsCameraMinimized\] = useState\(false\);\n/g, '');

// 3. Remove useEffect for srcObject
code = code.replace(/  useEffect\(\(\) => \{\n    if \(videoRef\.current && cameraStream\) \{\n      videoRef\.current\.srcObject = cameraStream;\n    \}\n  \}, \[cameraStream, isTestStarted\]\);\n\n/g, '');

// 4. Remove DETECTION STATUS SYNC
code = code.replace(/  \/\/ ── DETECTION STATUS SYNC ──\n  useEffect\(\(\) => \{\n    let isMounted = true;\n    const checkDetection = async \(\) => \{[\s\S]*?    \};\n  \}, \[isTestStarted\]\);\n\n/g, '');

// 5. Remove refs
code = code.replace(/  const isHeadRotatedRef = useRef\(false\);\n  const isFocusLostRef = useRef\(false\);\n  const isDetectionEnabledRef = useRef\(true\);\n/g, '');

// 6. Remove useEffect isDetectionEnabledRef
code = code.replace(/  useEffect\(\(\) => \{\n    isDetectionEnabledRef\.current = isDetectionEnabled;\n  \}, \[isDetectionEnabled\]\);\n\n/g, '');

// 7. Fix uploadViolationFrame
code = code.replace(/      let image = null;\n      if \(videoRef\.current && canvasRef\.current && videoRef\.current\.readyState >= 2\) \{\n        const canvas = canvasRef\.current;\n        canvas\.width = 240;\n        canvas\.height = 180;\n        canvas\.getContext\('2d'\)\.drawImage\(videoRef\.current, 0, 0, 240, 180\);\n        image = canvas\.toDataURL\('image\/jpeg', 0\.1\);\n      \}/g, '      let image = null;');

// 8. Remove startFaceTracking useEffect
code = code.replace(/  useEffect\(\(\) => \{\n    let timeoutId;\n\n    const startFaceTracking = async \(\) => \{[\s\S]*?    return \(\) => clearTimeout\(timeoutId\);\n  \}, \[isTestStarted, isTestSubmitted\]\);\n\n/g, '');

// 9. Remove uploadFrame useEffect
code = code.replace(/  useEffect\(\(\) => \{\n    let timeoutId;\n    const uploadFrame = async \(\) => \{[\s\S]*?    return \(\) => clearTimeout\(timeoutId\);\n  \}, \[isTestStarted, cameraStream, isTestSubmitted\]\);\n\n/g, '');

// 10. Remove CAMERA STATUS MONITORING
code = code.replace(/  \/\/ 🔥 ENGINE: CAMERA STATUS MONITORING\n  useEffect\(\(\) => \{\n    let intervalId;\n    const checkCameraStatus = \(\) => \{[\s\S]*?    return \(\) => clearInterval\(intervalId\);\n  \}, \[isTestStarted, isTestSubmitted, cameraStream\]\);\n\n/g, '');

// 11. Remove POLLING FOR DOCTOR WARNINGS
code = code.replace(/  \/\/ 🔥 ENGINE: POLLING FOR DOCTOR WARNINGS\n  useEffect\(\(\) => \{\n    let intervalId;\n    const pollDoctorWarnings = async \(\) => \{[\s\S]*?    return \(\) => clearInterval\(intervalId\);\n  \}, \[isTestStarted, isTestSubmitted\]\);\n\n/g, '');

// 12. Fix startTest
code = code.replace(/      const stream = await navigator\.mediaDevices\.getUserMedia\(\{ video: \{ width: 320, height: 240 \} \}\);\n      setCameraStream\(stream\);\n\n/g, '');
code = code.replace(/      toast\.error\("❌ Camera access is required to start the session!"\);\n/g, '');

// 13. Remove UI div
code = code.replace(/      <div className=\{`camera-proctor-box \$\{isCameraMinimized \? 'minimized' : ''\}`\}>\n        <video ref=\{videoRef\} autoPlay playsInline muted className="camera-video" \/>\n        <canvas ref=\{canvasRef\} style=\{\{ display: 'none' \}\} \/>\n        <div className="camera-status" onClick=\{\(\) => \{\n          if \(!isCameraMinimized\) \{\n            triggerWarning\("Hiding the camera feed is strictly prohibited!", "ui_minimize"\);\n          \}\n          setIsCameraMinimized\(!isCameraMinimized\);\n        \}\}>\n          <div className="pulse"><\/div>\n          \{isCameraMinimized \? 'VIEW FEED' : 'LIVE PROCTOR \(Minimize\)'\}\n        <\/div>\n      <\/div>\n/g, '');

fs.writeFileSync('src/QuestionPage.js', code);
console.log('Done');
