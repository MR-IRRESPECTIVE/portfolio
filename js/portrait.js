/* ============================================
   PORTRAIT.JS — WebGL Liquid Distortion Portrait
   Inspired by vshslv.com - GPU accelerated shader
   ============================================ */

(function () {
  const container = document.getElementById('portrait-canvas');
  if (!container || typeof THREE === 'undefined') return;

  let renderer, scene, camera, mesh, uniforms;
  let W = 0;
  let H = 0;

  const mouse  = new THREE.Vector2(0.5, 0.5);
  const target = new THREE.Vector2(0.5, 0.5);
  let hovering = false;

  function initPortrait() {
    W = container.offsetWidth;
    H = container.offsetHeight;
    if (W === 0 || H === 0) {
      requestAnimationFrame(initPortrait);
      return;
    }

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 10);
    camera.position.z = 1;

    // Uniforms
    uniforms = {
      uTexture:     { value: null },
      uMouse:       { value: new THREE.Vector2(0.5, 0.5) },
      uTime:        { value: 0 },
      uHover:       { value: 0 },
      uImgAspect:   { value: 1.0 },
      uPlaneAspect: { value: W / H }
    };

    const vertexShader = `
      varying vec2 vUv;
      uniform vec2 uMouse;
      uniform float uHover;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Subtle 3D tilt from mouse (max ~4deg equivalent)
        float tiltX = (uMouse.x - 0.5) * uHover * 20.0;
        float tiltY = (uMouse.y - 0.5) * uHover * 20.0;
        pos.x += tiltX;
        pos.y += tiltY;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec2  uMouse;
      uniform float uTime;
      uniform float uHover;
      uniform float uImgAspect;
      uniform float uPlaneAspect;

      void main() {
        // Object-fit: cover UV correction
        vec2 ratio = vec2(
          min(uPlaneAspect / uImgAspect, 1.0),
          min(uImgAspect / uPlaneAspect, 1.0)
        );
        vec2 uv = vec2(
          vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
          vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );

        // Ripple distortion anchored at mouse position
        float dist    = distance(uv, uMouse);
        float falloff = smoothstep(0.45, 0.0, dist);
        float ripple  = sin(dist * 22.0 - uTime * 4.0) * 0.012 * uHover * falloff;
        vec2  distUv  = uv + normalize(uv - uMouse) * ripple;

        vec4 col = texture2D(uTexture, distUv);

        // Dynamic light glow at mouse
        float glow = smoothstep(0.5, 0.0, dist) * 0.15 * uHover;
        col.rgb += glow;

        gl_FragColor = col;
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true
    });

    const geo  = new THREE.PlaneGeometry(W, H, 32, 32);
    mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    // Load transparent portrait
    const loader = new THREE.TextureLoader();
    loader.load('assets/rohan_transparent.png', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      uniforms.uTexture.value   = tex;
      uniforms.uImgAspect.value = tex.image.width / tex.image.height;
    });

    // Event Listeners for Interaction
    setupInteraction();

    // Start Loop
    animate();
  }

  function updateTarget(clientX, clientY) {
    if (!renderer) return;
    const rect = container.getBoundingClientRect();
    target.x = (clientX - rect.left) / rect.width;
    target.y = 1.0 - (clientY - rect.top) / rect.height;
  }

  function setupInteraction() {
    document.addEventListener('mousemove', e => updateTarget(e.clientX, e.clientY));
    container.addEventListener('mouseenter', () => { hovering = true; });
    container.addEventListener('mouseleave', () => { hovering = false; target.set(0.5, 0.5); });

    container.addEventListener('touchstart',  e => { hovering = true;  updateTarget(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    container.addEventListener('touchmove',   e => updateTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    container.addEventListener('touchend',    ()  => { hovering = false; target.set(0.5, 0.5); });

    window.addEventListener('resize', () => {
      W = container.offsetWidth;
      H = container.offsetHeight;
      if (W === 0 || H === 0) return;
      
      renderer.setSize(W, H);
      camera.left   = -W / 2;
      camera.right  =  W / 2;
      camera.top    =  H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(W, H, 32, 32);
      uniforms.uPlaneAspect.value = W / H;
    });
  }

  // Animation
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;
    
    const delta = clock.getDelta();
    uniforms.uTime.value += delta;

    mouse.lerp(target, 0.08);
    uniforms.uMouse.value.copy(mouse);

    const targetHover = hovering ? 1.0 : 0.0;
    uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.06;

    renderer.render(scene, camera);
  }

  // Init call
  initPortrait();
})();
