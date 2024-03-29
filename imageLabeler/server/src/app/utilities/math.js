const Vec3 = require('gl-matrix/cjs/vec3');
const Mat4 = require('gl-matrix/cjs/mat4')

function cross()
{
  let v1 = Vec3.fromValues(0, 0, 1);
  let v2 = Vec3.fromValues(0, 1, 0);
  let v3 = Vec3.create();
  Vec3.cross(v3, v1, v2);
  console.log(`cross of ${v1} and ${v2}: ${v3}`);
}

/**
 * Distance from a point to a line; defining the line with 2 points
 * @param {Vec3} linePoint1 One point on the line.
 * @param {Vec3} linePoint2 Second point on the line.
 * @param {Vec3} point The point to measure the distance from.
 */
function lineToPoint(linePoint1, linePoint2, point)
{
  let linePointsDiff = Vec3.create();
  let point2Diff = Vec3.create();
  Vec3.subtract(linePointsDiff, linePoint2, linePoint1);
  Vec3.subtract(point2Diff, linePoint1, point);
  let crossResult = Vec3.create();
  Vec3.cross(crossResult, linePointsDiff, point2Diff);
  let numer = Vec3.length(crossResult);
  let denom = Vec3.length(linePointsDiff);
  return numer / denom;
}

/**
 * determine if 2 values are 'identical' based on some margin of error.
 * @param {number} a first number
 * @param {number} b second number
 * @param {number} by maximum difference
 * @returns {boolean} true if a is near b
 */
function isNear(a, b, by)
{
  let diff = Math.abs(a - b);
  return diff < by;
}

/**
 * Convenient method to load one column of the 4x4 matrix.
 * @param {Mat4} mat The matrix to load the column
 * @param {number} col The column index (0-3 for 4x4 matrix)
 * @param {number} v0 First row
 * @param {number} v1 Second row
 * @param {number} v2 Third row
 * @param {number} v3 Fourth row.
 */
function loadMat4Column(mat, col, v0, v1, v2, v3)
{
  mat[col * 4 + 0] = v0;
  mat[col * 4 + 1] = v1;
  mat[col * 4 + 2] = v2;
  mat[col * 4 + 3] = v3;
}

/**
 * Print the matrix for debugging support.
 * @param {Mat4} mat
 * @param {string} title
 */
function printMat(mat, title)
{
  console.log(`print of ${title}`)
  for (let row = 0; row < 4; row++)
  {
    let col = 0;
    let v1 = mat[col * 4 + row];
    let v2 = mat[(col + 1) * 4 + row];
    let v3 = mat[(col + 2) * 4 + row];
    let v4 = mat[(col + 3) * 4 + row];
    console.log(v1.toFixed(2),
      v2.toFixed(2),
      v3.toFixed(2),
      v4.toFixed(2))
  }
}

module.exports = {
  lineToPoint,
  isNear,
  loadMat4Column,
  printMat
};
