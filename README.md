# Introduction
In **[slack](https://slack.com/)** world, everyone can generate own **bot** service.  
And here is the **[Sparki](http://arcbotics.com/products/sparki/)**(powered by [Arduino](https://www.arduino.cc/)). [Sparki](http://arcbotics.com/products/sparki/) is a robot.  

Let's combine the services. You can control [Sparki](http://arcbotics.com/products/sparki/) from [slack](https://slack.com/).  
On this project, i made him a Coffee delivery robot.  
He gets all your orders, responds to your questions and deliver a coffee to your place, gently.

# It's working
Check the test video.
https://youtu.be/TqP_HGcdzCo

# Ingredients
* [Sparki](http://arcbotics.com/products/sparki/)
  * Five Infrared sensors for line following
  * Ultrasonic sensor for detecting whether robot has a coffee
  * Beep for notifying that robot reaches each terminals.
  * Sparki arms for hodling a coffee cup
  * Serial Communication via Bluetooth
* [slack](https://slack.com/)
  * [Bot Service](https://api.slack.com/bot-users)
* Node.js Server (Mac OS X)
  * Serial Communication via Bluetooth
  * Kicking Slack Bot API
  * State management/Control for Sparki

# Recipe
1. Create a sample project that Sparki and Node.js can communicate via Bluetooth.  
2. Create a sample project that slack and Node.js can communicate via slack API.  
3. Mix 1. and 2.  
**You can download all sources from [here](https://github.com/dosuken123/CoffeeServeRobot).**  

# References
https://www.npmjs.com/package/slackbots
https://www.npmjs.com/package/serialport
https://scotch.io/tutorials/building-a-slack-bot-with-node-js-and-chuck-norris-super-powers
http://arcbotics.com/lessons/sparki/
