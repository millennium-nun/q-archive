// 3D artifacts.
// One full-viewport WebGL canvas sits behind the page. Each artifact <div>
// gets its own scene + camera, and is drawn into the part of the canvas that
// lines up with that <div> (scissor/viewport), so the models scroll with the page.
(function () {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  const isSmallScreen = () => window.innerWidth <= 768 || window.innerHeight <= 550;

  // Models are Draco-compressed; the decoder lives next to three.js.
  THREE.DRACOLoader.setDecoderPath("js/vendor/three/draco/");
  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(new THREE.DRACOLoader());

  function makeScene(selector, modelUrl) {
    const elem = document.querySelector(selector);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 2, 1, 1000);
    camera.position.set(5, 1.5, 6.5);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Drag to rotate on larger screens; on phones the model turns as you scroll.
    const controls = new THREE.OrbitControls(camera, elem);
    controls.enableZoom = false;
    controls.enablePan = false;
    if (isSmallScreen()) controls.enabled = false;

    const light = new THREE.DirectionalLight(0xffffff, 0.4);
    light.position.set(10, 10, 10);
    camera.add(light);

    return { elem, scene, camera, modelUrl, requested: false };
  }

  const artifacts = [
    makeScene("#boat", "assets/models/WebBoat.glb"),
    makeScene("#dress", "assets/models/WebDress.glb"),
    makeScene("#ladder", "assets/models/WebLadder.glb"),
    makeScene("#bucket", "assets/models/WebBucket.glb"),
    makeScene("#oar", "assets/models/WebOar.glb"),
    makeScene("#headdress", "assets/models/WebHeaddress.glb"),
  ];

  // Load each model only when its section is getting close (about two
  // screens away), so the page doesn't wait on all six up front.
  function load(a) {
    if (a.requested) return;
    a.requested = true;
    loader.load(
      a.modelUrl,
      (gltf) => a.scene.add(gltf.scene),
      undefined,
      (err) => console.error("Could not load " + a.modelUrl, err)
    );
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const a = artifacts.find((x) => x.elem === entry.target);
          if (a) {
            load(a);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200% 0px" }
    );
    artifacts.forEach((a) => io.observe(a.elem));
  } else {
    artifacts.forEach(load);
  }

  function resizeIfNeeded() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) renderer.setSize(w, h, false);
  }

  function renderArtifact({ scene, camera, elem }) {
    const { left, right, top, bottom, width, height } = elem.getBoundingClientRect();
    const offscreen =
      bottom < 0 ||
      top > canvas.clientHeight ||
      right < 0 ||
      left > canvas.clientWidth;
    if (offscreen) return;

    camera.aspect = width / height;
    if (isSmallScreen()) {
      camera.position.x = 8.2 * Math.cos(window.scrollY / 120);
      camera.position.z = 8.2 * Math.sin(window.scrollY / 120);
      camera.lookAt(scene.position);
    }
    camera.updateProjectionMatrix();

    const positiveYUpBottom = canvas.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);
    renderer.render(scene, camera);
  }

  function frame() {
    resizeIfNeeded();
    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);
    canvas.style.transform = `translateY(${window.scrollY}px)`;
    artifacts.forEach(renderArtifact);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
