# Introduction
In **[slack](https://slack.com/)** world, everyone can generate own **bot** service.  
And here is the **[Sparki](http://arcbotics.com/products/sparki/)**(powered by [Arduino](https://www.arduino.cc/)). [Sparki](http://arcbotics.com/products/sparki/) is a robot.  

Let's combine the services. You can control [Sparki](http://arcbotics.com/products/sparki/) from [slack](https://slack.com/).  
On this project, i made him a Coffee delivery robot.  
He gets all your orders, responds to your questions and deliver a coffee to your place, gently.

# It's working
1. New order comes from my boss! Sparki responds.  
  TODO: Movie  
2. Sparki arrived at a pot, and calls me. I cook a coffee and give him.  
  TODO: Movie  
3. Now Sparki is delivering a coffee to my boss. I hope my boss is patient...  
  TODO: Movie
4. My boss seems to be inpatient... He asked Sparki what he's doing right now.  
  TODO: Movie
5. Phew! It was long way! Here is your coffee. I'm going to back home. Bye!  
  TODO: Movie
6. I arrived at home now. Waiting next order.  
  TODO: Movie

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
TODO: from dev memo
