import type { CesiumWidget } from "cesium";
import { initializeOrbit } from "../../core/orbital/calculation";
import { normalizeEpoch } from "../../core/orbital/omm";
import { spacecraft } from "./atlas-catalog";
import { Cartesian2, Cartesian3, Color, PointPrimitiveCollection, PolylineCollection } from "./cesium-engine";

const start = Math.max(...spacecraft.map(({ elements }) => Date.parse(normalizeEpoch(elements.EPOCH))));
const duration = Math.ceil(86_400 / spacecraft[0].elements.MEAN_MOTION);
const utc = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" });

const toCartesian = ({ x, y, z }: { x: number; y: number; z: number }) => new Cartesian3(x, y, z);

const story = [
  {
    title: "Two spacecraft, one mission",
    copy: "Sentinel-2B observes land and coastal waters in visible and infrared light. Its images help track changes in vegetation and water.",
  },
  {
    title: "Keeping the record going",
    copy: "Sentinel-2C took over from Sentinel-2A in January 2025. It carries the same 13-band instrument design so measurements can continue across spacecraft generations.",
  },
];

export function connectAtlas(root: HTMLElement, widget: CesiumWidget, signal: AbortSignal) {
  const get = <T extends HTMLElement = HTMLElement>(attribute: string) =>
    root.querySelector<T>(`[${attribute}]`)!;
  const { scene, camera } = widget;
  const tracks = scene.primitives.add(new PolylineCollection());
  const markers = scene.primitives.add(new PointPrimitiveCollection());
  const entries = spacecraft.map((item) => {
    const orbit = initializeOrbit({ spacecraftId: item.id, elements: item.elements });
    const color = Color.fromCssColorString(item.color);
    const path = tracks.add({
      positions: orbit.sampleOrbit(new Date(start), 35).map(({ positionEarthFixedM }) =>
        toCartesian(positionEarthFixedM)),
      width: 2,
    });
    const point = markers.add({
      id: item.id,
      color,
      outlineColor: Color.fromCssColorString("#050d17"),
      outlineWidth: 2,
      pixelSize: 9,
    });
    return { ...item, orbit, color, path, point };
  });

  const discovery = get("data-atlas");
  const inspector = get("data-atlas-inspector");
  const timeline = get("data-atlas-time");
  const panels = [discovery, inspector, timeline];
  const search = get<HTMLInputElement>("data-atlas-search");
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-spacecraft]")];
  const isolate = get<HTMLInputElement>("data-atlas-isolate");
  const seek = get<HTMLInputElement>("data-atlas-seek");
  const speed = get<HTMLSelectElement>("data-atlas-speed");
  const play = get<HTMLButtonElement>("data-atlas-play");
  const clock = get<HTMLTimeElement>("data-atlas-clock");
  const epoch = get<HTMLTimeElement>("data-atlas-epoch");
  const source = get<HTMLAnchorElement>("data-atlas-source");
  const storyButton = get<HTMLButtonElement>("data-atlas-story");
  const storyPanel = root.querySelector<HTMLElement>("#atlas-story")!;
  const back = get<HTMLButtonElement>("data-story-back");
  const next = get<HTMLButtonElement>("data-story-next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let selected = 0;
  let chapter = 0;
  let seconds = 0;
  let frame = 0;

  function setTime(element: HTMLTimeElement, date: Date) {
    element.dateTime = date.toISOString();
    element.textContent = `${utc.format(date)} UTC`;
  }

  function renderTime() {
    const date = new Date(start + seconds * 1000);
    for (const entry of entries) {
      entry.point.position = toCartesian(entry.orbit.calculatePosition(date).positionEarthFixedM);
    }
    seek.value = String(Math.floor(seconds));
    if (clock.dateTime.slice(0, 19) !== date.toISOString().slice(0, 19)) setTime(clock, date);
    scene.requestRender();
  }

  function select(index: number) {
    selected = index;
    const entry = entries[selected];
    entries.forEach(({ color, path, point }, i) => {
      const active = i === selected;
      path.show = point.show = active || !isolate.checked;
      path.material.uniforms.color = color.withAlpha(active ? 0.95 : 0.45);
      path.width = active ? 2.5 : 1.5;
      point.pixelSize = active ? 11 : 8;
      buttons[i].setAttribute("aria-pressed", String(active));
    });
    get("data-atlas-name").textContent = entry.name;
    get("data-atlas-inclination").textContent = `${entry.elements.INCLINATION.toFixed(2)}°`;
    get("data-atlas-period").textContent = `${(1440 / entry.elements.MEAN_MOTION).toFixed(1)} min`;
    source.href = entry.source;
    setTime(epoch, new Date(normalizeEpoch(entry.elements.EPOCH)));
    scene.requestRender();
  }

  function locate() {
    const position = widget.ellipsoid.cartesianToCartographic(entries[selected].point.position);
    const destination = Cartesian3.fromRadians(position.longitude, position.latitude, 13_500_000, widget.ellipsoid);
    camera.flyTo({
      destination,
      orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
      duration: reducedMotion.matches ? 0 : 1.15,
    });
  }

  function showChapter(index: number) {
    chapter = index;
    get("data-story-title").textContent = story[chapter].title;
    get("data-story-copy").textContent = story[chapter].copy;
    back.disabled = chapter === 0;
    next.disabled = chapter === story.length - 1;
    select(chapter);
    locate();
  }

  function closeStory() {
    storyPanel.hidden = true;
    storyButton.setAttribute("aria-expanded", "false");
  }

  function choose(index: number) {
    closeStory();
    select(index);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    play.textContent = "Play";
  }

  function togglePlayback() {
    if (frame) {
      stop();
      return;
    }
    if (seconds >= duration) seconds = 0;
    play.textContent = "Pause";
    let previous = performance.now();
    const tick = (now: number) => {
      seconds = Math.min(duration, seconds + (now - previous) / 1000 * Number(speed.value));
      previous = now;
      renderTime();
      if (seconds < duration) frame = requestAnimationFrame(tick);
      else stop();
    };
    frame = requestAnimationFrame(tick);
  }

  seek.max = String(duration);
  renderTime();
  select(0);
  widget.canvas.addEventListener("click", (event) => {
    const rect = widget.canvas.getBoundingClientRect();
    const hit = scene.pick(new Cartesian2(event.clientX - rect.left, event.clientY - rect.top));
    const index = entries.findIndex(({ id }) => id === hit?.id);
    if (index >= 0) choose(index);
  }, { signal });
  buttons.forEach((button, index) => button.addEventListener("click", () => choose(index), { signal }));
  search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    buttons.forEach((button) => {
      button.hidden = !button.textContent!.toLowerCase().includes(term);
    });
    get("data-no-results").hidden = buttons.some((button) => !button.hidden);
  }, { signal });
  isolate.addEventListener("change", () => select(selected), { signal });
  get("data-atlas-focus").addEventListener("click", locate, { signal });
  storyButton.addEventListener("click", () => {
    if (!storyPanel.hidden) {
      closeStory();
      return;
    }
    storyPanel.hidden = false;
    storyButton.setAttribute("aria-expanded", "true");
    showChapter(0);
  }, { signal });
  back.addEventListener("click", () => showChapter(chapter - 1), { signal });
  next.addEventListener("click", () => showChapter(chapter + 1), { signal });
  play.addEventListener("click", togglePlayback, { signal });
  seek.addEventListener("input", () => {
    seconds = Number(seek.value);
    renderTime();
  }, { signal });
  signal.addEventListener("abort", () => {
    stop();
    panels.forEach((panel) => { panel.hidden = true; });
  }, { once: true });

  return () => panels.forEach((panel) => { panel.hidden = false; });
}
