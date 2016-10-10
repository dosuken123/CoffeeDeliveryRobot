//
//  ViewController.swift
//  Arduino_Servo
//
//  Created by Owen L Brown on 9/24/14.
//  Copyright (c) 2014 Razeware LLC. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
  
  @IBOutlet weak var imgBluetoothStatus: UIImageView!
  @IBOutlet weak var positionSlider: UISlider!

  var timerTXDelay: NSTimer?
  var allowTX = true
  var lastPosition: UInt8 = 255

	override func viewDidLoad() {
		super.viewDidLoad()
		// Do any additional setup after loading the view, typically from a nib.
    
    // Rotate slider to vertical position
    let superView = self.positionSlider.superview
    positionSlider.removeFromSuperview()
    positionSlider.removeConstraints(self.view.constraints)
    positionSlider.translatesAutoresizingMaskIntoConstraints = true
    positionSlider.transform = CGAffineTransformMakeRotation(CGFloat(M_PI_2))
    positionSlider.frame = CGRect(x: 0.0, y: 0.0, width: 100.0, height: 300.0)
    superView?.addSubview(self.positionSlider)
    positionSlider.autoresizingMask = [UIViewAutoresizing.FlexibleLeftMargin, UIViewAutoresizing.FlexibleRightMargin]
    positionSlider.center = CGPointMake(view.bounds.midX, view.bounds.midY)
    
    // Set thumb image on slider
    positionSlider.setThumbImage(UIImage(named: "Bar"), forState: UIControlState.Normal)
    
    // Watch Bluetooth connection
    NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("connectionChanged:"), name: BLEServiceChangedStatusNotification, object: nil)
    
    // Start the Bluetooth discovery process
    btDiscoverySharedInstance
	}
  
  deinit {
    NSNotificationCenter.defaultCenter().removeObserver(self, name: BLEServiceChangedStatusNotification, object: nil)
  }
  
  override func viewWillDisappear(animated: Bool) {
    super.viewWillDisappear(animated)
    
    self.stopTimerTXDelay()
  }
  
  @IBAction func positionSliderChanged(sender: UISlider) {
    self.sendPosition(UInt8(sender.value))
  }

  func connectionChanged(notification: NSNotification) {
    // Connection status changed. Indicate on GUI.
    let userInfo = notification.userInfo as! [String: Bool]
    
    dispatch_async(dispatch_get_main_queue(), {
      // Set image based on connection status
      if let isConnected: Bool = userInfo["isConnected"] {
        if isConnected {
          self.imgBluetoothStatus.image = UIImage(named: "Bluetooth_Connected")
          
          // Send current slider position
          self.sendPosition(UInt8( self.positionSlider.value))
        } else {
          self.imgBluetoothStatus.image = UIImage(named: "Bluetooth_Disconnected")
        }
      }
    });
  }
  
  func sendPosition(position: UInt8) {
    
    /******** (2) CODE TO BE ADDED *******/
    
  }
  
  func timerTXDelayElapsed() {
    self.allowTX = true
    self.stopTimerTXDelay()
    
    // Send current slider position
    self.sendPosition(UInt8(self.positionSlider.value))
  }
  
  func stopTimerTXDelay() {
    if self.timerTXDelay == nil {
      return
    }
    
    timerTXDelay?.invalidate()
    self.timerTXDelay = nil
  }
  
}

