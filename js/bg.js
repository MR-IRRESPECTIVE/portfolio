/* ============================================
   BG.JS — Three.js Interactive Particle Background
   with ShaderMaterial + mouse repulsion physics
   ============================================ */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;
  const isSmallPhone = window.innerWidth < 480;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  // Cap pixel ratio lower on mobile for GPU performance
  renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Tiered particle count by device size
  const count = isSmallPhone ? 800 : isMobile ? 1200 : 3500;

  const positions    = new Float32Array(count * 3);
  const basePos      = new Float32Array(count * 3);
  const velocities   = new Float32Array(count * 3);
  const colors       = new Float32Array(count * 3);
  const colorA       = new THREE.Color('#30b8ff');
  const colorB       = new THREE.Color('#0d0d0d');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 22;
    const y = (Math.random() - 0.5) * 22;
    const z = (Math.random() - 0.5) * 10;

    positions[i3]     = basePos[i3]     = x;
    positions[i3 + 1] = basePos[i3 + 1] = y;
    positions[i3 + 2] = basePos[i3 + 2] = z;

    // Bias heavily towards bright blue
    const t   = Math.pow(Math.random(), 3); // cube bias → most particles stay near blue
    const col = colorA.clone().lerp(colorB, t);
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  // Shader Material for glowing soft circles
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;

      void main() {
        vColor = color;
        vec3 pos = position;
        // Gentle organic drift
        pos.y += sin(uTime * 0.4 + pos.x * 0.15) * 0.15;
        pos.x += cos(uTime * 0.25 + pos.y * 0.1) * 0.1;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = clamp(15.0 / -mv.z, 0.5, 3.0);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 xy = gl_PointCoord - 0.5;
        float r  = length(xy);
        if (r > 0.5) discard;
        // Brighter glow falloff
        float alpha = smoothstep(0.5, 0.0, r) * 1.0;
        gl_FragColor = vec4(vColor * 1.4, alpha);
      }
    `,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Mouse world-space position
  const mouseWorld = { x: 0, y: 0 };
  const rotTarget  = { x: 0, y: 0 };

  function onMouseMove(clientX, clientY) {
    // Normalized -1..1
    const nx = (clientX / window.innerWidth)  * 2 - 1;
    const ny = -(clientY / window.innerHeight) * 2 + 1;
    // World approx at z=0
    mouseWorld.x = nx * 10;
    mouseWorld.y = ny * 10;
    rotTarget.x  = ny * 0.2;
    rotTarget.y  = nx * 0.2;
  }

  document.addEventListener('mousemove', e => onMouseMove(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => {
    onMouseMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;

    // Smooth rotation based on mouse
    particles.rotation.x += (rotTarget.x - particles.rotation.x) * 0.04;
    particles.rotation.y += (rotTarget.y - particles.rotation.y) * 0.04;
    particles.rotation.z  = elapsed * 0.01;

    // Skip physics on mobile for perf
    if (!isMobile) {
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];

        const dx = px - mouseWorld.x;
        const dy = py - mouseWorld.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < 20) {
          const f = (20 - d2) / 20;
          velocities[i3]     += dx * f * 0.015;
          velocities[i3 + 1] += dy * f * 0.015;
        }

        // Spring back
        velocities[i3]     += (basePos[i3]     - px) * 0.04;
        velocities[i3 + 1] += (basePos[i3 + 1] - py) * 0.04;
        velocities[i3 + 2] += (basePos[i3 + 2] - pz) * 0.04;

        // Friction
        velocities[i3]     *= 0.82;
        velocities[i3 + 1] *= 0.82;
        velocities[i3 + 2] *= 0.82;

        pos[i3]     += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        pos[i3 + 2] += velocities[i3 + 2];
      }
      geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})();
