import {
  DEMO_CURVE_ANCHORS,
  multiplierAtElapsedMs,
} from '../src/domain/h24-curve.mjs';

const width = 722;
const height = 270;
const left = 58;
const top = 30;
const bottom = 300;
const endTime = DEMO_CURVE_ANCHORS.at(-1).elapsedMs;
const maxMultiplier = DEMO_CURVE_ANCHORS.at(-1).multiplier;
const slider = document.querySelector('#elapsed');
const elapsedReadout = document.querySelector('#elapsed-readout');
const multiplierReadout = document.querySelector('#multiplier-readout');
const curvePath = document.querySelector('#curve');
const areaPath = document.querySelector('#area');
const marker = document.querySelector('#marker');

function coordinates(elapsedMs) {
  const multiplier = multiplierAtElapsedMs(elapsedMs);
  const x = left + (elapsedMs / endTime) * width;
  const y = bottom - (Math.log(multiplier) / Math.log(maxMultiplier)) * (bottom - top);
  return { x, y, multiplier };
}

function drawCurve() {
  const samples = Array.from({ length: 121 }, (_, index) => {
    return coordinates((endTime * index) / 120);
  });
  const path = samples.map((point, index) => {
    return (index === 0 ? 'M ' : 'L ') + point.x.toFixed(2) + ' ' + point.y.toFixed(2);
  }).join(' ');
  curvePath.setAttribute('d', path);
  areaPath.setAttribute('d', path + ' L ' + (left + width) + ' ' + bottom + ' L ' + left + ' ' + bottom + ' Z');
}

function updateReadout() {
  const elapsedMs = Number(slider.value);
  const point = coordinates(elapsedMs);
  elapsedReadout.value = (elapsedMs / 1000).toFixed(1) + ' s';
  multiplierReadout.value = point.multiplier.toFixed(2) + '×';
  marker.setAttribute('cx', point.x.toFixed(2));
  marker.setAttribute('cy', point.y.toFixed(2));
}

drawCurve();
slider.addEventListener('input', updateReadout);
updateReadout();
