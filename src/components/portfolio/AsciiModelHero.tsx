import { useEffect, useRef, useState } from 'react';

/** Characters ordered from empty to dense; index 0 must stay blank. */
const CHARSET = ' .:-=+*#%@';
const GLYPH_SIZE = 64;
/** Target CSS pixels per ASCII cell. */
const CELL_SIZE = 7;
const MAX_PIXEL_RATIO = 2;
const AUTO_ROTATE_SPEED = 0.12;
const DRAG_SENSITIVITY = 0.006;
const INERTIA_DAMPING = 0.94;

/**
 * "Marble Bust 01" by Rico Cilliers (CC0), via Poly Haven:
 * https://polyhaven.com/a/marble_bust_01
 * Textures stripped and repacked to GLB; the material is overridden at runtime.
 */
const MODEL_URL = '/models/marble-bust.glb';
/** Longest dimension of the model after normalization, in world units. */
const MODEL_SIZE = 3.0;
/** Base orientation applied to the loaded model, before user rotation. */
const MODEL_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0];

const readThemeColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--light').trim() || '#e5e5e5';

function createGlyphAtlas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = GLYPH_SIZE * CHARSET.length;
  canvas.height = GLYPH_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = `${GLYPH_SIZE * 0.9}px "Fragment Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < CHARSET.length; i++) {
    ctx.fillText(CHARSET[i], (i + 0.5) * GLYPH_SIZE, GLYPH_SIZE * 0.55);
  }
  return canvas;
}

const ASCII_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uGlyphs;
  uniform vec2 uGrid;
  uniform float uGlyphCount;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 scaled = vUv * uGrid;
    vec2 cell = floor(scaled);
    vec2 cellUv = fract(scaled);
    vec3 scene = texture2D(uScene, (cell + 0.5) / uGrid).rgb;
    float lum = pow(dot(scene, vec3(0.299, 0.587, 0.114)), 0.75);
    float idx = floor(clamp(lum, 0.0, 1.0) * (uGlyphCount - 1.0) + 0.5);
    vec2 glyphUv = vec2((idx + cellUv.x) / uGlyphCount, cellUv.y);
    float glyph = texture2D(uGlyphs, glyphUv).r;
    gl_FragColor = vec4(uColor, glyph);
  }
`;

const ASCII_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export function AsciiModelHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const THREE = await import('three');
      if (disposed) {
        return;
      }

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch {
        setWebglFailed(true);
        return;
      }

      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      // pan-y keeps vertical page scroll working on touch; horizontal drags rotate.
      canvas.style.touchAction = 'pan-y';
      canvas.style.cursor = 'grab';
      container.appendChild(canvas);

      // Model scene, rendered at ASCII-grid resolution.
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 20);
      camera.position.set(0, 0, 5.2);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(1.5, 2, 4.5);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
      fillLight.position.set(-3, -1, -2.5);
      scene.add(keyLight, fillLight, new THREE.AmbientLight(0xffffff, 0.4));

      // Single flat-white material: the ASCII pass only cares about luminance,
      // so shading must come from the lights, not the model's own textures.
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.1 });
      const model = new THREE.Group();
      model.rotation.set(...MODEL_ROTATION);
      scene.add(model);

      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      if (disposed) {
        renderer.dispose();
        canvas.remove();
        return;
      }
      new GLTFLoader().load(MODEL_URL, (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });

        // Center on origin and normalize the longest side to MODEL_SIZE.
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = MODEL_SIZE / Math.max(size.x, size.y, size.z);
        root.position.copy(center).multiplyScalar(-scale);
        root.scale.setScalar(scale);
        model.add(root);
      });

      const renderTarget = new THREE.WebGLRenderTarget(2, 2, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: true
      });

      // Fullscreen ASCII pass.
      const glyphTexture = new THREE.CanvasTexture(createGlyphAtlas());
      glyphTexture.minFilter = THREE.LinearFilter;
      glyphTexture.magFilter = THREE.LinearFilter;

      const asciiMaterial = new THREE.ShaderMaterial({
        vertexShader: ASCII_VERTEX_SHADER,
        fragmentShader: ASCII_FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uScene: { value: renderTarget.texture },
          uGlyphs: { value: glyphTexture },
          uGrid: { value: new THREE.Vector2(2, 2) },
          uGlyphCount: { value: CHARSET.length },
          uColor: { value: new THREE.Color(readThemeColor()) }
        }
      });
      const asciiScene = new THREE.Scene();
      asciiScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), asciiMaterial));
      const asciiCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) {
          return;
        }
        const cols = Math.max(24, Math.round(width / CELL_SIZE));
        const rows = Math.max(16, Math.round(height / CELL_SIZE));
        renderTarget.setSize(cols, rows);
        asciiMaterial.uniforms.uGrid.value.set(cols, rows);
        camera.aspect = cols / rows;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
        renderer.setSize(width, height, false);
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      // Drag-to-rotate with inertia; idles back to a slow auto-rotate.
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let velocityY = 0;
      let velocityX = 0;

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.style.cursor = 'grabbing';
        canvas.setPointerCapture(event.pointerId);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) {
          return;
        }
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        velocityY = dx * DRAG_SENSITIVITY;
        velocityX = dy * DRAG_SENSITIVITY;
        model.rotation.y += velocityY;
        model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + velocityX, -1.2, 1.2);
      };
      const onPointerUp = (event: PointerEvent) => {
        dragging = false;
        canvas.style.cursor = 'grab';
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      };
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      // Only render while on screen and the tab is visible.
      let rafId = 0;
      let running = false;
      let inView = true;
      let lastTime = 0;

      const frame = (time: number) => {
        rafId = requestAnimationFrame(frame);
        const delta = lastTime === 0 ? 1 / 60 : Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        if (!dragging) {
          velocityY *= INERTIA_DAMPING;
          velocityX *= INERTIA_DAMPING;
          model.rotation.y += velocityY + AUTO_ROTATE_SPEED * delta;
          model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + velocityX, -1.2, 1.2);
        }

        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(asciiScene, asciiCamera);
      };

      const syncLoop = () => {
        const shouldRun = inView && document.visibilityState === 'visible';
        if (shouldRun && !running) {
          running = true;
          lastTime = 0;
          rafId = requestAnimationFrame(frame);
        } else if (!shouldRun && running) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      };

      const intersectionObserver = new IntersectionObserver((entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        syncLoop();
      });
      intersectionObserver.observe(container);
      document.addEventListener('visibilitychange', syncLoop);
      syncLoop();

      const syncColor = () => {
        asciiMaterial.uniforms.uColor.value.set(readThemeColor());
      };
      window.addEventListener('portfolio-color-mode-change', syncColor);
      document.addEventListener('astro:page-load', syncColor);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', syncLoop);
        window.removeEventListener('portfolio-color-mode-change', syncColor);
        document.removeEventListener('astro:page-load', syncColor);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        material.dispose();
        glyphTexture.dispose();
        asciiMaterial.dispose();
        renderTarget.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (webglFailed) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D model rendered as ASCII art. Drag to rotate."
      style={{ width: '100%', aspectRatio: '2 / 1' }}
    />
  );
}
