import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget'
export class VrTransferFuncWidget {
  constructor () {
    this.widget = vtkPiecewiseGaussianWidget.newInstance()
    this.opacityTransfer = null
    this.renderWindow = null
    this.widget.updateStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      histogramColor: 'rgba(100, 100, 100, 0.5)',
      strokeColor: 'rgb(0, 0, 0)',
      activeColor: 'rgb(255, 255, 255)',
      handleColor: 'rgb(50, 150, 50)',
      buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
      buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
      buttonStrokeColor: 'rgba(0, 0, 0, 1)',
      buttonFillColor: 'rgba(255, 255, 255, 1)',
      strokeWidth: 2,
      activeStrokeWidth: 3,
      buttonStrokeWidth: 1.5,
      handleWidth: 3,
      iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
      padding: 10
    })
  }

  /**
   *
   * @param {HTMLDivElement} container
   * @param {vtkColorTransferFunction} colorTransferFunc
   * @param {vtkPiecewiseFunction} opacityFunc
   * @param {vtkImageData} image
   * @param {vtkRenderWindow} renderWindow
   */
  configure (container, colorTransferFunc,
    opacityFunc, image,
    renderWindow) {
    const data = image.getPointData().getScalars()
    const windowWidth = container.clientWidth
    const windowHeight = container.clientHeight
    this.widget.setContainer(container)
    this.widget.setSize(windowWidth, windowHeight)
    this.widget.setDataArray(data.getData())
    this.widget.setColorTransferFunction(colorTransferFunc)
    this.opacityTransfer = opacityFunc
    this.widget.applyOpacity(this.opacityTransfer)
    this.widget.bindMouseListeners()
    this.widget.onAnimation((start) => {
      if (start) {
        this.renderWindow.getInteractor().requestAnimation(this.widget)
      } else {
        this.renderWindow.getInteractor().cancelAnimation(this.widget)
      }
    })
    this.widget.onOpacityChange(() => {
      this.widget.applyOpacity(this.opacityTransfer)
      if (!this.renderWindow.getInteractor().isAnimating()) {
        this.renderWindow.render()
      }
    })
    this.renderWindow = renderWindow
  }

  addGaussian (position, height, width, xBias, yBias) {
    this.widget.addGaussian(position, height, width, xBias, yBias)
  }

  render () {
    this.renderWindow.render()
  }
}
