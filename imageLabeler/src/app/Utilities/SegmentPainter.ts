import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {mat4, vec3} from "gl-matrix";

export class SegmentPainter {
  /**
   * wikipedia reference: look at the vector formulation solution
   * for distance between a point and a line.
   * x = a + t*n
   * where x is a vector point on the line depending on parameter t,
   * a is point on the line
   * n is a unit vector parallel to the line
   * In the variables below, the roles in the vector formulation is as follows:
   * a: p1IJKScaled
   * n: p1p2Normalized (points from p1 to p2)
   * p:p0IJKScaled - the point to measure distance from.
   *
   * The distance formula is
   * distance(x=a+t*n,p) = length((p-a)-((p-a) dot n)*n)
   * where p is the point in question for the distance to line.
   * p:p0IJKScaled - the point to measure distance from.
   */
  spacing=vec3.fromValues(0,0,0);
  radius = 0;
  spacingInverted=vec3.fromValues(0,0,0);
  dimension = [0,0,0];
  majorAxis=-1;
  intensity = 0;
  ijk2lps = mat4.create();
  lps2ijk = mat4.create();
  endpoints:vec3[] = [];
  p1IJKScaled=vec3.create();
  p2IJKScaled=vec3.create();
  p0IJKScaled=vec3.create();
  p2MinusP1Scaled = vec3.create();
  p0MinusP1Scaled = vec3.create();
  p1p2Normalized = vec3.create();
  expansionQueue:vec3[]=[];
  paintQueue:vec3[] = [];
  labelPixels:Int16Array = new Int16Array(1);
  visitedBitMask = 0;
  segmentDistance=0;
  distanceTmp1 = vec3.create();
  distanceTmp2 = vec3.create();
  visitedPixels = 0;


  constructor()
  {
    this.endpoints.push(vec3.create());
    this.endpoints.push(vec3.create());
    this.visitedBitMask = (1 << 14); // want to keep positive for convenience/simplicity

  }
  distance(ijkUnscaled:vec3) {
    let computedDistance = 0.0;
    vec3.multiply(this.p0IJKScaled,ijkUnscaled,this.spacing);
    vec3.subtract(this.p0MinusP1Scaled,this.p0IJKScaled,this.p1IJKScaled);
    let p0p1dot =  vec3.dot(this.p1p2Normalized,this.p0MinusP1Scaled); // (p-a) dot n
    let alongSegment = true;
    if (p0p1dot < 0) {
      alongSegment = false;
      computedDistance=vec3.distance(this.p1IJKScaled,this.p0IJKScaled);
    //  console.log(`beyond p1 segment:${computedDistance}`);
    }
    if (p0p1dot > this.segmentDistance) {
      alongSegment = false;
      computedDistance=vec3.distance(this.p2IJKScaled,this.p0IJKScaled);
  //    console.log(`beyond p2 segment:${computedDistance}`);
    }
    if (alongSegment) {
      vec3.scale(this.distanceTmp1,this.p1p2Normalized,p0p1dot); // ((p-a) dot n)*n
      vec3.subtract(this.distanceTmp2,this.p0MinusP1Scaled,this.distanceTmp1); // (p-a)-((p-a dot n)*n
      computedDistance = vec3.length(this.distanceTmp2);
  //    console.log(`along segment:${computedDistance}`);

    }
    return computedDistance;

  }

  visited(ijkPoint:vec3) {
    let index = this.dimension[1]*this.dimension[0]*ijkPoint[2]+this.dimension[0]*ijkPoint[1]+ijkPoint[0];
    let value = this.labelPixels[index];
    value  &= this.visitedBitMask;
    return value !== 0;
  }
  visit(ijkPoint:vec3) {
    let index = this.dimension[1]*this.dimension[0]*ijkPoint[2]+this.dimension[0]*ijkPoint[1]+ijkPoint[0];
    let value = this.labelPixels[index];
    value = value | this.visitedBitMask;
    this.labelPixels[index] = value;
    this.visitedPixels++;
 //   console.log(`visit(${ijkPoint} v:${this.visitedPixels}`)
  }
  paint(ijkPoint:vec3,value:number) {
    let index = this.dimension[1]*this.dimension[0]*ijkPoint[2]+this.dimension[0]*ijkPoint[1]+ijkPoint[0];

    this.labelPixels[index] = value; // clears the visited bit
  }
  queue(ijkPoint:vec3) {
    // make a copy because we are no allocating at call time.
    let copy=vec3.create();
    vec3.copy(copy,ijkPoint);
    this.expansionQueue.push(copy);
    this.paintQueue.push(copy);
  }
  inBounds(ijk:vec3) {
    let axInBounds = true;
    for (let ax = 0;ax < 3;ax++) {
      axInBounds = axInBounds && (ijk[ax] >= 0);
      axInBounds = axInBounds && (this.dimension[ax]-1) >= ijk[ax];
    }
    return axInBounds;
  }

  /**
   * findInitialPoint return (-1,-1,-1) if the segment appears
   * to be completely outside the image.
   * Otherwise, it returns a point within the bounds of the volume
   * and near the line.
   */
  findInitialPoint() {
    let midPoint=vec3.create();
    vec3.add(midPoint,this.p1IJKScaled,this.p2IJKScaled);
    vec3.scale(midPoint,midPoint,0.5);
    vec3.multiply(midPoint,midPoint,this.spacingInverted);
    vec3.round(midPoint,midPoint);
    if (this.inBounds(midPoint)) {
      return midPoint;
    }
    else {
      return vec3.fromValues(-1,-1,-1);
    }
  }
  addNeighbors(ijkP:vec3) {
    let adj=vec3.create();
    let minSide = [this.dimension[0],this.dimension[1],this.dimension[2]];
    let maxSide = [-1,-1,-1];
    for (let ax = 0;ax < 3;ax++) {
      let c = Math.floor(ijkP[ax]);
      c = Math.max(c-1,0);
      minSide[ax] = c;
      c+=2;
      maxSide[ax] = Math.min(c,this.dimension[ax]-1);
    }
    for(let z = minSide[2];z <= maxSide[2];z++) {
      adj[2] = z;
      for (let y = minSide[1];y <= maxSide[1];y++) {
        adj[1] = y;
        for (let x = minSide[0];x <= maxSide[0];x++) {
          adj[0] = x;
          let d = 0;
          if (!this.visited(adj))
          {
            d = this.distance(adj);
            if (d <= this.radius) {
                this.visit(adj);
    //            console.log(`mark ${adj}`);
                this.queue(adj);
            }
            else {
    //          console.log(` point:${adj} distance too far:${d}`);
            }
          }
          else {
    //        console.log(`point ${adj} already visited`);
          }
        }
      }
    }
  }
  initDraw(p1LPS:vec3,p2LPS:vec3) {
    vec3.transformMat4(this.p1IJKScaled,p1LPS,this.lps2ijk);
    vec3.multiply(this.p1IJKScaled,this.p1IJKScaled,this.spacing);
    vec3.transformMat4(this.p2IJKScaled,p2LPS,this.lps2ijk);
    vec3.multiply(this.p2IJKScaled,this.p2IJKScaled,this.spacing);
    vec3.subtract(this.p2MinusP1Scaled,this.p2IJKScaled,this.p1IJKScaled);
    let majorAxis=-1;
    let majorAxisDisplacement=-1;
    for(let ax = 0;ax < 3;ax++) {
      let disp = Math.abs(this.p2MinusP1Scaled[ax]);
      if (disp > majorAxisDisplacement) {
        majorAxisDisplacement = disp;
        majorAxis = ax;
      }
    }
    this.majorAxis = majorAxis;
    let initialQueuePoint = this.findInitialPoint();
    if (initialQueuePoint[0] >=0) {
      this.visit(initialQueuePoint);
      this.queue(initialQueuePoint);
    }
    vec3.normalize(this.p1p2Normalized,this.p2MinusP1Scaled);
    this.segmentDistance = vec3.length(this.p2MinusP1Scaled);

  }
  configure(image:vtkImageData) {
    this.spacing = image.getSpacing();
    this.spacingInverted[0] = 1.0/this.spacing[0];
    this.spacingInverted[1] = 1.0/this.spacing[1];
    this.spacingInverted[2] = 1.0/this.spacing[2];
    this.dimension = image.getDimensions();
    mat4.copy(this.ijk2lps,image.getIndexToWorld());
    mat4.invert(this.lps2ijk,this.ijk2lps);
    this.labelPixels = image.getPointData().getScalars().getData() as Int16Array;
  }
  draw(p1LPS:vec3,p2LPS:vec3,radius:number,intensity:number) {

    this.intensity = intensity;
    this.visitedPixels = 0;
    this.radius = radius;
    this.initDraw(p1LPS,p2LPS);
    while (this.expansionQueue.length > 0) {
      let nextPoint = this.expansionQueue.shift();
      if (nextPoint) { // check is just to quiet typescript static check
        this.addNeighbors(nextPoint);
      }
    }
    // this both paints the color and clears the 'visited' bit.
    this.paintQueue.forEach((point,i)=> {
      this.paint(point,this.intensity);
    });
    this.paintQueue = [];
    return this.visitedPixels;
  }

}
