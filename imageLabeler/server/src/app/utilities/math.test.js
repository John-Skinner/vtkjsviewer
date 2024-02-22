const Math = require('./imageLoader.js');
const {isNear, lineToPoint, loadMat4Column} = require('./math');
const Vec3 = require('gl-matrix/cjs/vec3');
const Vec4 = require('gl-matrix/cjs/vec4');
const Mat4 = require('gl-matrix/cjs/mat4');
const expect = require('expect').expect;


test('lineToPoint', () =>
{
  // lineToPoint(linePoint1,linePoint2,point)
  let lp1 = Vec3.fromValues(2, 1, 10);
  let lp2 = Vec3.fromValues(4, 2, 10);
  let point = Vec3.fromValues(3, 1.5, 20);
  let distance = lineToPoint(lp1, lp2, point);
  expect(distance).toBeCloseTo(10, 0.1);
})
test('isNear', () =>
{
  let is = isNear(5, 5.1, 0.2);
  expect(is).toBeTruthy();
  is = isNear(5, 6, 0.2);
  expect(is).toBeFalsy();
})
test('loadMat4Column', () =>
{
  let m = Mat4.create();
  loadMat4Column(m, 0, 1, 0, 0, 0);
  loadMat4Column(m, 1, 0, 1, 0, 0);
  loadMat4Column(m, 2, 0, 0, 1, 0);
  loadMat4Column(m, 3, 1, 2, 3, 1);
  let v0 = Vec4.fromValues(1, 1, 1, 1);
  let vr = Vec4.create();
  Vec4.transformMat4(vr, v0, m);
  console.log(`vr:${vr}`);
  console.log(`m:${m}`);
})
