# Labelling tool for marking regions from MRI images.
In very early stage, just displays images with vtk.js

Refer to the wiki for design.

# To get DICOM images to serve, do the following:
1) Go to `central.xnat.org`
2) Pick [MR] tab
3) Under 'Project:' field, click the field and a list of projects is presented.
4) Select IGT_FMRI_NEURO
5) Click the [Submit] button.
6) Pick a session such as label [025 IGT_FMRI_NEURO) for 025
7) Select all the series
You will get the series as a zop file that contains DICOM part 10 files.
Unpack the files and put them into a directory structure:
```
exam
  series
    images
```
For example:
```
25
  11-SPGR
    000001.IMA
    000002.IMA
    ...
  12-DTI
    000001.IMA
    000002.IMA
    ...
  12-T2
    000001.IMA
    000002.IMA
    ...
```

In server/src/routes/routeController.js, update the `rootImagesDir` to point to the top directory for all exams.
