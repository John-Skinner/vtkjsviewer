import macro from '@kitware/vtk.js/macros'
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";

import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";

import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";

import {States} from '@kitware/vtk.js/Rendering/Core/InteractorStyle/Constants'
import {CameraSettings} from "../CameraSettings";
import {vec3} from "gl-matrix";
import {DownUpBtnState, AppMouseModes} from "./Constants";
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
export const AppStateNames = {
  ReportCursor: 1,
  PaintDraw: 2
};

function ImagePanZoomInteractorStyle(publicAPI, model)
{
  // Set our className
  model.classHierarchy.push('ImagePanZoomInteractorStyle');


  publicAPI.handleReportCursor = (callData) =>
  {
    //   console.log(`rc handler(${callData.position})`);
    let displayPos = vec3.fromValues(callData.position.x, callData.position.y, 0.0);
    model.view.rc(displayPos);
  }
  publicAPI.handleDraw = (callData) =>
  {
    //   console.log(`rc handler(${callData.position})`);
    let displayP1 = vec3.fromValues(model.previousDrawPoint.x, model.previousDrawPoint.y, 0.0);
    let displayP2 = vec3.fromValues(callData.position.x, callData.position.y, 0.0);
    let d = vec3.distance(displayP2,displayP1);
    if (d > 3) {
      model.view.draw(displayP1, displayP2, model.drawValue);
      model.previousDrawPoint.x = callData.position.x;
      model.previousDrawPoint.y = callData.position.y;
    }

  }
  publicAPI.endDraw = () => {
    model.view.endDraw();
}
  publicAPI.handlePan = (callData) =>
  {
    let displayPos = vec3.fromValues(callData.position.x, callData.position.y, 0.0);
    model.view.panTo(displayPos, model.panZoomStartPosition,
      model.panZoomOrigCamPos, model.panZoomOrigCamFocus);
  }
  publicAPI.handleZoom = (callData) =>
  {
    let camera = callData.pokedRenderer.getActiveCamera();
    let displayPos = vec3.fromValues(callData.position.x, callData.position.y, 0, 0);
    model.view.zoomTo(displayPos, model.panZoomStartPosition, model.panZoomOrigScale);

  }

  // Public API methods
  publicAPI.superHandleMouseMove = publicAPI.handleMouseMove;
  publicAPI.handleMouseMove = (callData) =>
  {
//    console.log(`btn1 state:${model.mouseBtn1State}`);
    const pos = callData.position;
    const renderer = callData.pokedRenderer;
    //   console.log(`mouse move state:${model.state} compared to wl:${States.IS_WINDOW_LEVEL}, slice:${States.IS_SLICE}`);
    //  console.log(` move btn1:${model.mouseBtn1Mode}`);
    switch (model.mouseBtn1Mode)
    {
      case AppMouseModes.WL:
        if (model.state === States.IS_WINDOW_LEVEL)
        {
          publicAPI.windowLevel(renderer, pos);
          publicAPI.invokeInteractionEvent({type: 'InteractionEvent'});
        }

        break;

      case AppMouseModes.PAN:
        if (model.mouseBtn1State === DownUpBtnState.DOWN)
        {
          publicAPI.handlePan(callData);
          publicAPI.invokeInteractionEvent({type: 'InteractionEvent'});
        }

        break;
      case AppMouseModes.PAGE:
        break;
      case AppMouseModes.ZOOM:
        if (model.mouseBtn1State === DownUpBtnState.DOWN)
        {
          publicAPI.handleZoom(callData);
          publicAPI.invokeInteractionEvent({type: 'InteractionEvent'});
        }
        break;
      case AppMouseModes.RC:
        if (model.mouseBtn1State === DownUpBtnState.DOWN)
        {
          publicAPI.handleReportCursor(callData);
        }
        break;
      case AppMouseModes.DRAW:
        if (model.mouseBtn1State === DownUpBtnState.DOWN)
        {
          publicAPI.handleDraw(callData);
        }
        break;

      default:
        break;
    }
    //  publicAPI.superHandleMouseMove(callData);
  };

  //----------------------------------------------------------------------------
  publicAPI.superHandleLeftButtonPress = publicAPI.handleLeftButtonPress;
  publicAPI.handleLeftButtonPress = (callData) =>
  {
    //   console.log(`InteractionMode:${model.interactionMode}`);
    //   console.log(`lmbPress(${model.mouseBtn1Mode}`)
    model.mouseBtn1State = DownUpBtnState.DOWN;
    const pos = callData.position;
    console.log(` press btn1:${model.mouseBtn1Mode}`);
    switch (model.mouseBtn1Mode)
    {
      case AppMouseModes.WL:
      {
        model.windowLevelStartPosition[0] = pos.x;
        model.windowLevelStartPosition[1] = pos.y;
        const property = model.view.getPrimaryImageSlice().getProperty();
        if (property)
        {
          model.windowLevelInitial[0] = property.getColorWindow();
          model.windowLevelInitial[1] = property.getColorLevel();
//    console.log(`start init wl:${model.windowLevelInitial[1]}`);
        }
        publicAPI.startWindowLevel();
      }
        break;
      case AppMouseModes.PAN:
      {
        model.panZoomStartPosition[0] = pos.x;
        model.panZoomStartPosition[1] = pos.y;
        let camera = callData.pokedRenderer.getActiveCamera();
        let camPos = camera.getPosition();
        let focus = camera.getFocalPoint();
        model.panZoomOrigCamPos[0] = camPos[0];
        model.panZoomOrigCamPos[1] = camPos[1];
        model.panZoomOrigCamPos[2] = camPos[2];
        model.panZoomOrigCamFocus[0] = focus[0];
        model.panZoomOrigCamFocus[1] = focus[1];
        model.panZoomOrigCamFocus[2] = focus[2];
        publicAPI.startPan();
      }
        break;
      case AppMouseModes.ZOOM:
        model.panZoomStartPosition[0] = pos.x;
        model.panZoomStartPosition[1] = pos.y;
        let camera = callData.pokedRenderer.getActiveCamera();
        model.panZoomOrigScale = camera.getParallelScale();
        publicAPI.startDolly();
        break;
      case AppMouseModes.PAGE:
        break;
      case AppMouseModes.RC:
        break;
      case AppMouseModes.DRAW:
      {
        model.previousDrawPoint.x = callData.position.x;
        model.previousDrawPoint.y = callData.position.y;
      }
        break;
    }
  };

  //--------------------------------------------------------------------------
  publicAPI.superHandleLeftButtonRelease = publicAPI.handleLeftButtonRelease;
  publicAPI.handleLeftButtonRelease = () =>
  {
    model.mouseBtn1State = DownUpBtnState.UP;
    //   console.log(` release btn1:${model.mouseBtn1Mode}`);
    switch (model.mouseBtn1Mode)
    {
      case AppMouseModes.WL:
        publicAPI.endWindowLevel();
        break;
      case AppMouseModes.PAN:
        publicAPI.endPan();
        break;
      case AppMouseModes.ZOOM:
        publicAPI.endDolly();
        break;
      case AppMouseModes.PAGE:
        break;
      case AppMouseModes.RC:
        break;
      case AppMouseModes.DRAW:
        publicAPI.endDraw();
        break;
      default:
        publicAPI.superHandleLeftButtonRelease();
    }

  };

  //--------------------------------------------------------------------------
  publicAPI.handleStartMouseWheel = () =>
  {
    //   console.log(`StartMouseWheel()`)
    publicAPI.startSlice();
  };

  //--------------------------------------------------------------------------
  publicAPI.handleEndMouseWheel = () =>
  {
    publicAPI.endSlice();
  };

  //--------------------------------------------------------------------------
  publicAPI.handleMouseWheel = (callData) =>
  {
    //   console.log(`handleMouseWheel(callData) ${callData.spinY}`);
    switch (model.mouseBtn1Mode)
    {
      case AppMouseModes.PAGE:
      case AppMouseModes.DRAW:
      case AppMouseModes.RC:
      case AppMouseModes.WL:
      case AppMouseModes.PAN:
      {
        const camera = callData.pokedRenderer.getActiveCamera();

        let directionCloserFurther = -1;
        if (callData.spinY > 0)
        {
          directionCloserFurther = 1;
        }

        CameraSettings.viewVolumeSlice(directionCloserFurther, model.view, camera);
      }
        break;

    }


  };

  //----------------------------------------------------------------------------
  publicAPI.windowLevel = (renderer, position) =>
  {
    model.windowLevelCurrentPosition[0] = position.x;
    model.windowLevelCurrentPosition[1] = position.y;
    const rwi = model._interactor;

    const size = rwi.getView().getViewportSize(renderer);

    const mWindow = model.windowLevelInitial[0];
    const level = model.windowLevelInitial[1];

    // Compute normalized delta
    let dx =
      ((model.windowLevelCurrentPosition[0] -
          model.windowLevelStartPosition[0]) *
        4.0) /
      size[0];
    let dy =
      ((model.windowLevelStartPosition[1] -
          model.windowLevelCurrentPosition[1]) *
        4.0) /
      size[1];

    // Scale by current values
    if (Math.abs(mWindow) > 0.01)
    {
      dx *= mWindow;
    } else
    {
      dx *= mWindow < 0 ? -0.01 : 0.01;
    }
    if (Math.abs(level) > 0.01)
    {
      dy *= level;
    } else
    {
      dy *= level < 0 ? -0.01 : 0.01;
    }

    // Abs so that direction does not flip
    if (mWindow < 0.0)
    {
      dx *= -1;
    }
    if (level < 0.0)
    {
      dy *= -1;
    }

    // Compute new mWindow level
    let newWindow = dx + mWindow;
    const newLevel = level - dy;

    if (newWindow < 0.01)
    {
      newWindow = 0.01;
    }
    //    console.log(`new wl:${newWindow} ${newLevel}`);
    let primaryProperty = model.view.getPrimaryImageSlice().getProperty();

    primaryProperty.setColorWindow(newWindow);
    primaryProperty.setColorLevel(newLevel);

  };

  //----------------------------------------------------------------------------
  publicAPI.slice = (renderer, position) =>
  {
    const rwi = model._interactor;

    const dy = position.y - model.lastSlicePosition;

    const camera = renderer.getActiveCamera();
    const range = camera.getClippingRange();
    let distance = camera.getDistance();

    // scale the interaction by the height of the viewport
    let viewportHeight = 0.0;
    if (camera.getParallelProjection())
    {
      viewportHeight = 2.0 * camera.getParallelScale();
    } else
    {
      const angle = vtkMath.radiansFromDegrees(camera.getViewAngle());
      viewportHeight = 2.0 * distance * Math.tan(0.5 * angle);
    }

    const size = rwi.getView().getViewportSize(renderer);
    const delta = (dy * viewportHeight) / size[1];
    distance += delta;

    // clamp the distance to the clipping range
    if (distance < range[0])
    {
      distance = range[0] + viewportHeight * 1e-3;
    }
    if (distance > range[1])
    {
      distance = range[1] - viewportHeight * 1e-3;
    }
    camera.setDistance(distance);

    model.lastSlicePosition = position.y;
  };


}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  windowLevelStartPosition: [0, 0],
  windowLevelCurrentPosition: [0, 0],
  panZoomStartPosition: [0, 0],
  panZoomOrigCamPos: vec3.create(),
  panZoomOrigCamFocus: vec3.create(),
  panZoomOrigScale: 1.0,
  lastSlicePosition: 0,
  windowLevelInitial: [1.0, 0.5],
  interactionMode: 'IMAGE2D',
  xViewRightVector: [0, 1, 0],
  xViewUpVector: [0, 0, -1],
  yViewRightVector: [1, 0, 0],
  yViewUpVector: [0, 0, -1],
  zViewRightVector: [1, 0, 0],
  zViewUpVector: [0, 1, 0],
  mouseBtn1Mode: AppMouseModes.WL,
  mouseBtn1State: DownUpBtnState.UP,
  previousDrawPoint: {x: 0, y: 0},
  drawValue: 0,
  view: null
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {})
{
  console.log(`ImagePanZoomInteractorStyle const model:${model}`);
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkInteractorStyleTrackballCamera.extend(publicAPI, model, initialValues);

  // Create get-set macros
  macro.setGet(publicAPI, model, ['interactionMode']);
  macro.setGet(publicAPI, model, ['view']);
  macro.setGet(publicAPI, model, ['mouseBtn1Mode']);
  macro.setGet(publicAPI, model, ['drawValue']);

  // For more macro methods, see "Sources/macros.js"

  // Object specific methods
  ImagePanZoomInteractorStyle(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'ImagePanZoomInteractorStyle');

// ----------------------------------------------------------------------------

export default {newInstance, extend};
