import type { CesiumWidget, PerspectiveFrustum } from "cesium";
import "cesium/Build/Cesium/Widgets/CesiumWidget/CesiumWidget.css";

const minimumHeight = 2_000_000;
const maximumHeight = 30_000_000;
const rotationStep = Math.PI / 18;
const halfShortAxisFov = 0.345;

class EarthGlobe extends HTMLElement {
  #widget?: CesiumWidget;
  #lifecycle?: AbortController;

  connectedCallback() {
    const lifecycle = new AbortController();
    this.#lifecycle = lifecycle;
    void this.#initialize(lifecycle.signal);
  }

  disconnectedCallback() {
    this.#lifecycle?.abort();
    this.#destroyWidget();
  }

  #destroyWidget() {
    this.#widget?.destroy();
    this.#widget = undefined;
  }

  async #initialize(signal: AbortSignal) {
    const viewport = this.querySelector<HTMLElement>("[data-viewport]")!;
    const staticMap = this.querySelector<HTMLElement>("[data-static-map]")!;
    const controls = this.querySelector<HTMLElement>("[data-interactive]")!;
    const status = this.querySelector<HTMLElement>("[data-status]")!;
    const creditContainer = this.querySelector<HTMLElement>("[data-engine-credit]")!;
    const fallback = () => {
      if (signal.aborted) return;
      this.#lifecycle?.abort();
      this.#destroyWidget();
      viewport.replaceChildren();
      creditContainer.replaceChildren();
      this.removeAttribute("data-ready");
      staticMap.hidden = false;
      controls.hidden = true;
      status.textContent = "The interactive globe is unavailable on this device or connection.";
    };

    this.removeAttribute("data-ready");
    staticMap.hidden = false;
    controls.hidden = true;
    status.textContent = "Loading interactive globe…";
    const timeout = window.setTimeout(fallback, 20_000);
    signal.addEventListener("abort", () => window.clearTimeout(timeout), { once: true });

    try {
      if (!document.createElement("canvas").getContext("webgl2")) {
        fallback();
        return;
      }

      const {
        Cartesian3, CesiumWidget, Color, Credit, CreditDisplay, DirectionalLight,
        Ellipsoid, EllipsoidTerrainProvider, Globe, ImageryLayer, Ion, SingleTileImageryProvider,
        SkyAtmosphere,
      } = await import("./cesium-engine");
      if (signal.aborted) return;
      Ion.defaultAccessToken = "";
      CreditDisplay.cesiumCredit = new Credit("CesiumJS", true);

      const imagery = await SingleTileImageryProvider.fromUrl(
        this.querySelector<HTMLImageElement>("[data-static-map] img")!.src,
      );
      if (signal.aborted) return;

      const ellipsoid = Ellipsoid.WGS84;
      const globe = new Globe(ellipsoid);
      globe.showWaterEffect = false;
      globe.showGroundAtmosphere = false;
      globe.enableLighting = true;
      globe.lightingFadeOutDistance = 0;
      globe.lightingFadeInDistance = 24_000_000;
      globe.dynamicAtmosphereLighting = false;

      const skyAtmosphere = new SkyAtmosphere(ellipsoid);
      skyAtmosphere.atmosphereLightIntensity = 18;

      const widget = new CesiumWidget(viewport, {
        ellipsoid,
        globe,
        baseLayer: new ImageryLayer(imagery),
        terrainProvider: new EllipsoidTerrainProvider({ ellipsoid }),
        skyBox: false,
        skyAtmosphere,
        creditContainer,
        contextOptions: { webgl: { alpha: true } },
        scene3DOnly: true,
        shouldAnimate: false,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        showRenderLoopErrors: false,
        orderIndependentTranslucency: false,
        msaaSamples: 2,
      });
      this.#widget = widget;
      const { scene, camera } = widget;
      scene.backgroundColor = Color.TRANSPARENT;
      // Use a fixed key light so the opening view is independent of time of day.
      const lightDirection = Cartesian3.fromDegrees(-62, 52, 0, ellipsoid);
      scene.light = new DirectionalLight({
        direction: Cartesian3.negate(lightDirection, lightDirection),
        intensity: 1,
      });
      scene.fog.enabled = false;
      const controller = scene.screenSpaceCameraController;
      controller.enableTilt = false;
      controller.enableLook = false;
      controller.inertiaSpin = 0;
      controller.inertiaZoom = 0;
      controller.minimumZoomDistance = minimumHeight;
      controller.maximumZoomDistance = maximumHeight;
      camera.constrainedAxis = Cartesian3.UNIT_Z;

      // Cesium's perspective FOV is measured along the longer viewport axis.
      // Keep the shorter axis constant so the resting globe fits on wide screens.
      const frustum = camera.frustum as PerspectiveFrustum;
      const fitViewport = () => {
        const { clientWidth: width, clientHeight: height } = viewport;
        if (!width || !height) return;
        const ratio = Math.max(width, height) / Math.min(width, height);
        frustum.fov = 2 * Math.atan(Math.tan(halfShortAxisFov) * ratio);
        scene.requestRender();
      };
      const observer = new ResizeObserver(fitViewport);
      observer.observe(viewport);
      signal.addEventListener("abort", () => observer.disconnect(), { once: true });
      fitViewport();

      const reset = () => {
        camera.setView({
          destination: Cartesian3.fromDegrees(15, 50, 13_500_000, ellipsoid),
          orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
        });
      };
      reset();
      scene.requestRender();

      scene.renderError.addEventListener(() => queueMicrotask(fallback));
      widget.canvas.addEventListener("webglcontextlost", fallback, { signal });

      const stopWaiting = scene.postRender.addEventListener(() => {
        if (!globe.tilesLoaded) return;
        stopWaiting();
        window.clearTimeout(timeout);
        this.setAttribute("data-ready", "");
        staticMap.hidden = true;
        controls.hidden = false;
        status.textContent = "";
      });

      controls.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest<HTMLButtonElement>("button[data-camera]");
        if (!button) return;
        const height = camera.positionCartographic.height;
        switch (button.dataset.camera) {
          case "left": camera.rotateLeft(rotationStep); break;
          case "right": camera.rotateRight(rotationStep); break;
          case "up": camera.rotateUp(rotationStep); break;
          case "down": camera.rotateDown(rotationStep); break;
          case "in": camera.zoomIn(Math.max(0, Math.min(height * 0.25, height - minimumHeight))); break;
          case "out": camera.zoomOut(Math.max(0, Math.min(height / 3, maximumHeight - height))); break;
          case "reset": reset(); break;
        }
        scene.requestRender();
      }, { signal });
    } catch {
      fallback();
    }
  }
}

customElements.define("earth-globe", EarthGlobe);
