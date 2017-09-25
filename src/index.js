const regl = require('regl')();
const mat4 = require('gl-mat4');
let shouldbounce = false;
let currBounce = 4;
let grow1 = false;
let grow2 = false;
let bounceTick = 0;
let grow1tick = 0;
let grow2tick = 0;
function handleKeydown({key}){
  switch (key) {
    case " ":
      shouldbounce = !shouldbounce;
      break;
    case "j":
      grow1 = !grow1;
      break;
    case "k":
      grow2 = !grow2;
      break;
    default:
      break;
  }
  console.log(shouldbounce)
  console.log(event);
}

window.addEventListener("keydown", handleKeydown, { passive: true })

function rand2(l, u) {
  return l + Math.random() * (u - l);
}
function rectangle([x0,  z0], w, l) {
  var w2 = w / 2;
  var l2 = l /2
  const vert = [
    [x0 - w2, 0, z0 - l2],
    [x0 + w2, 0, z0 - l2],
    [x0 - w2, 0, z0 + l2],
    [x0 + w2, 0, z0 + l2]
  ];

  const els = [
    [0, 1, 2],
    [1, 2, 3], //bottom

  ];

  const colors = Array(vert.length / 4)
    .fill(0)
    .map(() => {
      const c = [rand2(0.0, 1.0), rand2(0.0, 1.0), rand2(0.0, 1.0), 1.0];
      return Array(4).fill(c);
    })
    .reduce((a, e) => a.concat(e));

  return { vert, els, colors };
}
function rectangleUp([x0, y0 ], w, h) {
  var w2 = w / 2;
  var h2 = h / 2;
  const vert = [
    [x0 - w2, y0 - h2, 0],
    [x0 + w2, y0 - h2, 0],
    [x0 - w2, y0 + h2, 0],
    [x0 + w2, y0 + h2, 0]
  ];

  const els = [
    [0, 1, 2],
    [1, 2, 3], //bottom

  ];

  const colors = Array(vert.length / 4)
    .fill(0)
    .map(() => {
      const c = [rand2(0.0, 1.0), rand2(0.0, 1.0), rand2(0.0, 1.0), 1.0];
      return Array(4).fill(c);
    })
    .reduce((a, e) => a.concat(e));

  return { vert, els, colors };
}
function rectangleSideUp([z0, y0 ], l, h) {
  var l2 = l / 2;
  var h2 = h / 2;
  const vert = [
    [ 0, y0 - h2, z0 - l2],
    [ 0, y0 - h2, z0 + l2],
    [ 0, y0 + h2, z0 - l2],
    [ 0, y0 + h2, z0 + l2]
  ];

  const els = [
    [0, 1, 2],
    [1, 2, 3], //bottom

  ];

  const colors = Array(vert.length / 4)
    .fill(0)
    .map(() => {
      const c = [rand2(0.0, 1.0), rand2(0.0, 1.0), rand2(0.0, 1.0), 1.0];
      return Array(4).fill(c);
    })
    .reduce((a, e) => a.concat(e));

  return { vert, els, colors };
}

const drawRect = regl({
    frag: `
      precision mediump float;
      varying vec4 pColor;
      void main () {
        gl_FragColor = pColor;
      }
    `,
    vert: `
      precision mediump float;
      attribute vec4 color;
      attribute vec3 position;
      uniform mat4 projection, view;
      varying lowp vec4 pColor;
      void main() {
        gl_Position = projection * view * vec4(position, 1);
        pColor = color;
      }
    `,
    attributes: {
      position: regl.prop('vert'),
      color: regl.prop('colors')
    },
    elements: regl.prop('els'),
    uniforms: {
        view: function({ tick }) {
          const t = 0.01 * tick;
          return mat4.lookAt(
            [],
            [8 * Math.cos(t), 3 + 3 * Math.sin(t), 8],
            [0, 0, 0],
            [0, 1, 0]
          );
        },

        projection: function({ viewportWidth, viewportHeight }) {
          return mat4.perspective(
            [],
            Math.PI / 4,
            viewportWidth / viewportHeight,
            0.01,
            100
          );
        }
      }
  });

function draw() {
  regl.frame(function({tick}){
    regl.clear({
      color: [0.0, 0.0, 0.0, 1]
    });
    const t = 0.01 * tick;
    if (shouldbounce) bounceTick += 0.01;
    if (grow1) grow1tick += 0.01;
    if (grow2) grow2tick += 0.01;
    const lengthIncrement = 3 * Math.cos(grow1tick);
    const widthincrement = 3 + 3 * Math.sin(grow2tick);
    const bounce = 2 * Math.tan(bounceTick);
    currBounce = bounce;
    const toFive = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    const lying = toFive.map((valX) => toFive.map( (valY) => rectangle([-valY*4, -valX*bounce], widthincrement, 2))).reduce((curr, prev) => curr.concat(prev))
    const standing = toFive.map((valX) => toFive.map( (valY) => rectangleUp([-valY*bounce, -valX*4], 1, lengthIncrement))).reduce((curr, prev) => curr.concat(prev))
    const sideUp = toFive.map((valX) => toFive.map( (valY) => rectangleSideUp([-valY*4, -valX*bounce], 1, 2))).reduce((curr, prev) => curr.concat(prev))
    const rects = lying.concat(standing, sideUp);
    drawRect(
      rects
    )

  });
}

draw();
