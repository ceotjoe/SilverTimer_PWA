# SilverTimer_PWA

Basic web version of the [SilverTimer app](https://www.holzapfel-online.de/silvertimer/)

The web app is hosted via GitHub Pages and can be started via this [link](https://ceotjoe.github.io/SilverTimer_PWA/).

The app is intended to calculate the necessary time to reach a desired PPM concentration of silver colloid in water.

Just select the device you own, amount of water in ml and the desired PPM. After clicking the calculate button it will show the time in which the electrolysis is finished.

Supported devices (can be changed easily on demand):

|Device|Current|
|---|---|
|Maximus Smart 10|10 mA|
|Maximus Smart 20|20 mA|
|Maximus 20|20 mA|
|Ionic Pulser|5 mA|

It is possible to add the app as PWA to tho home screen of mobile devices like android or iOS.

If you're using the timer function, this is currently only working in the foreground. Means the page needs to be open all the time until the timer is finished.

This app was developed just as a proof of concept for AI supported development with the help of [Grok AI](https://grok.com). 

>[!IMPORTANT]
>DISCLAIMER: The PPM within the dispersion will be different due to certain circrumstances while electrolysis. It can only be really measured by probing a sample in laboratory.This app can only replace the >tables which are usually delivered by the manufacturer of the device.
