import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import {
  ScanSearch,
  Box,
  RotateCcw,
  Upload,
  Camera,
  PawPrint,
  Sparkles,
  Info,
} from "lucide-react";

const DOG_MODELS = [
  { name: "Beagle", file: "/models/beagle.glb", size: "Small-Medium", lifespan: "12-15 years", origin: "England", temperament: "Curious, friendly, gentle", keywords: ["beagle", "walker hound", "foxhound", "english foxhound", "basset"] },
  { name: "Siberian Husky", file: "/models/advent_calendar_day_15__husky_dog.glb", size: "Medium-Large", lifespan: "12-15 years", origin: "Siberia", temperament: "Energetic, loyal, playful", keywords: ["husky", "siberian husky", "malamute", "eskimo dog"] },
  { name: "Blue Eyed Boxer", file: "/models/blue_eyed_boxer_dog.glb", size: "Medium-Large", lifespan: "10-12 years", origin: "Germany", temperament: "Playful, brave, loyal", keywords: ["boxer"] },
  { name: "Brown Labrador Retriever", file: "/models/brown_labrador_retriever_v1.glb", size: "Large", lifespan: "10-12 years", origin: "Canada", temperament: "Friendly, smart, active", keywords: ["labrador", "retriever", "chesapeake", "flat-coated"] },
  { name: "Chihuahua", file: "/models/chihuahua_chiwawa_dog_nomad_sculpt_basemesh.glb", size: "Small", lifespan: "14-16 years", origin: "Mexico", temperament: "Alert, lively, loyal", keywords: ["chihuahua"] },
  { name: "Chow Chow", file: "/models/chow_chow.glb", size: "Medium", lifespan: "8-12 years", origin: "China", temperament: "Calm, loyal, independent", keywords: ["chow", "chow chow"] },
  { name: "Dachshund", file: "/models/dachshund.glb", size: "Small", lifespan: "12-16 years", origin: "Germany", temperament: "Clever, brave, playful", keywords: ["dachshund", "sausage dog"] },
  { name: "Dachshund Sculpt", file: "/models/dachshund_sculpt.glb", size: "Small", lifespan: "12-16 years", origin: "Germany", temperament: "Curious, brave, lively", keywords: ["dachshund sculpt"] },
  { name: "Doberman", file: "/models/doberman.glb", size: "Large", lifespan: "10-13 years", origin: "Germany", temperament: "Alert, loyal, fearless", keywords: ["doberman", "dobermann", "pinscher", "miniature pinscher", "appenzeller", "entlebucher"] },
  { name: "Bulldog", file: "/models/bulldog_statue.glb", size: "Medium", lifespan: "8-10 years", origin: "England", temperament: "Calm, courageous, gentle", keywords: ["bulldog", "english bulldog", "pug"] },
  { name: "French Bulldog", file: "/models/french_bulldog_sitting.glb", size: "Small-Medium", lifespan: "10-12 years", origin: "France", temperament: "Adaptable, playful, smart", keywords: ["french bulldog", "frenchie"] },
  { name: "German Shepherd", file: "/models/german_shepherd_in_profile.glb", size: "Large", lifespan: "9-13 years", origin: "Germany", temperament: "Confident, loyal, alert", keywords: ["german shepherd", "shepherd", "alsatian", "kelpie"] },
  { name: "Belgian German Shepherd", file: "/models/belgiangerman_shepherd_-_sat_pose_meshy.glb", size: "Large", lifespan: "10-14 years", origin: "Belgium/Germany", temperament: "Protective, intelligent, loyal", keywords: ["belgian shepherd", "belgian malinois", "malinois", "shepherd"] },
  { name: "Golden Retriever", file: "/models/golden_retriever_sitting.glb", size: "Large", lifespan: "10-12 years", origin: "Scotland", temperament: "Friendly, intelligent, kind", keywords: ["golden retriever"] },
  { name: "Rottweiler", file: "/models/low-poly_rottweiler_dog.glb", size: "Large", lifespan: "8-10 years", origin: "Germany", temperament: "Strong, confident, loyal", keywords: ["rottweiler"] },
  { name: "Pitbull", file: "/models/pitbull.glb", size: "Medium", lifespan: "12-14 years", origin: "United States", temperament: "Strong, loyal, affectionate", keywords: ["pitbull", "pit bull", "staffordshire", "american staffordshire", "bull terrier"] },
  { name: "Shih Tzu", file: "/models/shih_tzu.glb", size: "Small", lifespan: "10-16 years", origin: "Tibet/China", temperament: "Affectionate, friendly, outgoing", keywords: ["shih-tzu", "shih tzu", "shihtzu", "lhasa", "pekinese", "tibetan terrier"] },
  { name: "Great Dane", file: "/models/great_dane_low_poly.glb", size: "Giant", lifespan: "7-10 years", origin: "Germany", temperament: "Gentle, friendly, patient", keywords: ["great dane", "dane"] },
  { name: "Spanish Mastiff", file: "/models/spanish_mastiff.glb", size: "Giant", lifespan: "10-12 years", origin: "Spain", temperament: "Calm, protective, loyal", keywords: ["spanish mastiff", "mastiff"] },
  { name: "Saint Bernard", file: "/models/saint_bernard.glb", size: "Giant", lifespan: "8-10 years", origin: "Switzerland", temperament: "Gentle, calm, friendly", keywords: ["saint bernard", "st bernard"] },
  { name: "Generic Dog", file: "/models/dog.glb", size: "Medium", lifespan: "10-13 years", origin: "Unknown", temperament: "Friendly, active, loyal", keywords: ["dog", "canine", "mixed breed"] },
  { name: "Poodle", file: "/models/perro_poodle_caniche.glb", size: "Medium", lifespan: "12-15 years", origin: "Germany/France", temperament: "Intelligent, active, alert", keywords: ["poodle"] },
  {
  name: "Corgi",
  file: "/models/astro_corgi.glb",
  size: "Small",
  lifespan: "12-15 years",
  origin: "Wales",
  temperament: "Friendly, smart, playful",
  keywords: [
    "corgi",
    "welsh corgi",
    "pembroke",
    "cardigan corgi"
  ],
},
];

useGLTF.preload("/models/beagle.glb");

const heroImages = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
];

function getScore(predictions, dog) {
  let total = 0;

  for (const prediction of predictions) {
    const label = prediction.className.toLowerCase();

    for (const keyword of dog.keywords) {
      if (label.includes(keyword.toLowerCase())) {
        total += prediction.probability * 100;
      }
    }
  }

  return total;
}

function chooseDog(predictions) {
  if (!predictions.length) {
    return { dog: DOG_MODELS[0], confidence: 0, label: "manual preview" };
  }

  const ranked = DOG_MODELS.map((dog) => ({
    dog,
    score: getScore(predictions, dog),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (best.score > 0) {
    return {
      dog: best.dog,
      confidence: Math.min(98, Math.max(55, Math.round(best.score))),
      label: predictions[0].className,
    };
  }

  return {
    dog: DOG_MODELS[0],
    confidence: Math.round(predictions[0].probability * 100),
    label: predictions[0].className,
  };
}

function chooseDogFromText(text) {
  const clean = String(text || "").toLowerCase();

  return (
    DOG_MODELS.find((dog) => clean.includes(dog.name.toLowerCase())) ||
    DOG_MODELS.find((dog) =>
      dog.keywords.some((keyword) => clean.includes(keyword.toLowerCase()))
    ) ||
    null
  );
}

function Loader() {
  return (
    <Html center>
      <div className="loader">Loading 3D model...</div>
    </Html>
  );
}

function SafeModel({ dog }) {
  const group = useRef();
  const { scene } = useGLTF(dog.file);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x || 1, size.y || 1, size.z || 1);
    const scale = 2.25 / maxAxis;

    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    clone.scale.setScalar(scale);

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.28;
  });

  return (
    <group ref={group} position={[0, -1, 0]} rotation={[0, Math.PI * 0.12, 0]}>
      <primitive object={normalized} />
    </group>
  );
}

async function verifyWithOpenRouter(file) {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const { analyzeDogImage } = await import("./utils/openrouter");
    return await analyzeDogImage(base64Image);
  } catch (error) {
    console.warn("OpenRouter fallback skipped:", error);
    return null;
  }
}

function Landing({ onStart }) {
  return (
    <main className="landing">
      <nav className="nav-shell">
        <div className="nav-brand">
          <PawPrint size={18} />
          <b>DogLens</b>
        </div>

        <div className="nav-links">
          <button onClick={onStart}>3D Scan</button>
          <button onClick={onStart}>Models</button>
          <button onClick={onStart}>Start</button>
        </div>
      </nav>

      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            AI BREED SCAN WITH 3D AR PREVIEW
          </div>

          <h1>Discover Dog Breeds in 3D</h1>

          <p>
            Upload or take a dog photo and DogLens will scan the image, match the
            closest breed, and display an interactive 3D model with breed details.
          </p>

          <div className="hero-actions">
            <button className="primary" onClick={onStart}>Get Started</button>
            <button className="secondary" onClick={onStart}>View Models</button>
          </div>

          <div className="stats-row">
            <div><b>{DOG_MODELS.length}</b><span>3D Models</span></div>
            <div><b>AI</b><span>Breed Scan</span></div>
            <div><b>AR</b><span>Preview UI</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <img src={heroImages[0]} alt="dog" />
          <div className="badge badge-one"><Box size={16} /> Interactive 3D model</div>
          <div className="badge badge-two"><ScanSearch size={16} /> Camera AI scan</div>
          <div className="mini-card">
            <img src={heroImages[1]} alt="dog group" />
            <span>Model matching</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [model, setModel] = useState(null);
  const [selectedDog, setSelectedDog] = useState(DOG_MODELS[0]);
  const [image, setImage] = useState(null);
  const [results, setResults] = useState([]);
  const [confidence, setConfidence] = useState(98);
  const [matchedLabel, setMatchedLabel] = useState("manual preview");
  const [loadingAI, setLoadingAI] = useState(true);
  const [scanStatus, setScanStatus] = useState("Loading AI model...");
  const [cameraOpen, setCameraOpen] = useState(false);
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  useEffect(() => {
    let active = true;

    mobilenet.load({ version: 2, alpha: 0.5 }).then((loaded) => {
      if (active) {
        setModel(loaded);
        setLoadingAI(false);
        setScanStatus("AI ready");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    setCameraOpen(false);
  }

  async function openCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        cameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
      });

      cameraStreamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.warn("Camera stream unavailable, falling back to file input", error);
      cameraInputRef.current?.click();
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      stopCamera();
      scanFile(file);
    }, "image/jpeg", 0.92);
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !cameraStreamRef.current) return;

    videoRef.current.srcObject = cameraStreamRef.current;
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function scanFile(file) {
    if (!file || !model) return;

    setLoadingAI(true);
    setScanStatus("Scanning image...");

    const url = URL.createObjectURL(file);
    setImage(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = async () => {
      try {
        const predictions = await model.classify(img, 5);
        setResults(predictions);

        const match = chooseDog(predictions);

        setSelectedDog(match.dog);
        setConfidence(match.confidence);
        setMatchedLabel(match.label);

        if (match.confidence < 70) {
          setScanStatus("Low confidence. Verifying with AI...");
          const aiResult = await verifyWithOpenRouter(file);

          if (aiResult?.breed) {
            const aiDog = chooseDogFromText(aiResult.breed);

            if (aiDog) {
              setSelectedDog(aiDog);
              setConfidence(aiResult.confidence || 80);
              setMatchedLabel(`AI verified: ${aiResult.breed}`);
            }
          }
        }

        setScanStatus("Scan complete");
      } catch (error) {
        console.error("Scan failed:", error);
        setScanStatus("Scan failed. Try another image.");
      } finally {
        setLoadingAI(false);
      }
    };
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    scanFile(file);
  }

  function manualSelect(dog) {
    setSelectedDog(dog);
    setConfidence(98);
    setMatchedLabel("manual selected");
  }

  if (!started) return <Landing onStart={() => setStarted(true)} />;

  return (
    <main className="scan-page">
      <nav className="nav-shell app-nav">
        <div className="nav-brand">
          <PawPrint size={18} />
          <b>DogLens</b>
        </div>

        <div className="nav-links">
          <button onClick={() => setStarted(false)}>Home</button>
          <button onClick={() => document.querySelector("#models")?.scrollIntoView({ behavior: "smooth" })}>Models</button>
        </div>
      </nav>

      <section className="scan-grid">
        <div className="viewer-card">
          <div className="card-head">
            <div>
              <h2>3D AR Result</h2>
              <p>Model stays centered with simple fixed rotation</p>
            </div>
            <span>Auto rotate enabled</span>
          </div>

          <div className="viewer-wrap">
            <Canvas camera={{ position: [0, 1.05, 5.2], fov: 38 }}>
              <color attach="background" args={["#f7f1e6"]} />
              <ambientLight intensity={2.2} />
              <directionalLight position={[5, 6, 5]} intensity={2.8} />
              <spotLight position={[-5, 4, 4]} intensity={1.1} angle={0.4} />

              <Suspense fallback={<Loader />}>
                <SafeModel dog={selectedDog} />
                <Environment preset="studio" />
                <ContactShadows position={[0, -1.05, 0]} opacity={0.22} scale={6} blur={2.6} />
              </Suspense>

              <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} target={[0, 0, 0]} />
            </Canvas>

            <div className="ring" />
          </div>

          <div className="detected-card">
            <div>
              <span>DETECTED BREED</span>
              <h3>{selectedDog.name}</h3>
              <small>{matchedLabel}</small>
            </div>
            <strong>{confidence}%</strong>
          </div>
        </div>

        <div className="panel ai-panel">
          <h2><ScanSearch size={20} /> AI Scan</h2>
          <p>Upload a photo or take a new dog picture using your phone camera.</p>

          <div className="upload-actions">
            <button className="upload-btn" type="button" onClick={() => uploadInputRef.current?.click()}>
              <Upload size={16} />
              Upload Photo
            </button>
            <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleUpload} hidden />

            <button className="upload-btn camera-btn" type="button" onClick={openCamera}>
              <Camera size={16} />
              Take Photo
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleUpload}
              hidden
            />
          </div>

          {cameraOpen && (
            <div className="camera-capture">
              <video ref={videoRef} autoPlay playsInline muted />

              <div className="camera-capture-actions">
                <button type="button" onClick={captureFromCamera}>Capture</button>
                <button type="button" className="ghost" onClick={stopCamera}>Cancel</button>
              </div>
            </div>
          )}

          {image ? (
            <div className="photo-frame">
              <img src={image} alt="uploaded dog" />
            </div>
          ) : (
            <div className="photo-frame placeholder">
              <img src={heroImages[2]} alt="dog sample" />
            </div>
          )}

          <small>{scanStatus}</small>
        </div>

        <div className="panel compact results-panel">
          <h2>AI Results</h2>

          {results.length ? (
            results.map((r) => {
              const pct = Math.round(r.probability * 100);

              return (
                <div className="result" key={r.className}>
                  <div>
                    <span>{r.className}</span>
                    <b>{pct}%</b>
                  </div>

                  <em>
                    <i style={{ width: `${pct}%` }} />
                  </em>
                </div>
              );
            })
          ) : (
            <p className="muted">Upload or take a dog photo to show AI predictions.</p>
          )}

          <button
            className="reset"
            onClick={() => {
              stopCamera();
              setImage(null);
              setResults([]);
              setConfidence(98);
              setSelectedDog(DOG_MODELS[0]);
              setMatchedLabel("manual preview");
              setScanStatus("AI ready");
            }}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="panel breed-panel">
          <h2><Info size={20} /> Breed Information</h2>

          <div className="info-grid">
            <div><span>SIZE</span><b>{selectedDog.size}</b></div>
            <div><span>LIFESPAN</span><b>{selectedDog.lifespan}</b></div>
            <div><span>ORIGIN</span><b>{selectedDog.origin}</b></div>
            <div><span>TEMPERAMENT</span><b>{selectedDog.temperament}</b></div>
          </div>
        </div>
      </section>

      <section className="models-section" id="models">
        <h2>Available 3D Dog Models</h2>

        <div className="model-grid">
          {DOG_MODELS.map((dog) => (
            <button
              key={dog.name}
              onClick={() => manualSelect(dog)}
              className={selectedDog.name === dog.name ? "active" : ""}
            >
              <PawPrint size={15} />
              <div>
                <b>{dog.name}</b>
                <span>{dog.size}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}