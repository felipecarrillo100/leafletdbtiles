# Project leaflet dbtiles

## Description
Project leaflet-dbtiles integrates Leaflet to IONIC Capacitor environment with tiles from DB

The Map supports WMTS web mercator capture to DB 


## To build for android
Use IONIC environment to build
```
npm install 
npx cap add android
ionic build

ionic capacitor sync android
npx cap open android
```

## To test

Run in browser

```
ionic serve
``` 
Run in Android live reload

```
ionic cap run android -l --external
```



## Requirements.
* IONIC and access to WMTS server or TMS server
* Android or iOS device