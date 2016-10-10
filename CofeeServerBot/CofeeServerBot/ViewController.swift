//
//  ViewController.swift
//  CofeeServerBot
//
//  Created by shinyamaeda on 10/10/16.
//  Copyright © 2016 shinyamaeda. All rights reserved.
//

import Cocoa
import CoreBluetooth

class ViewController: NSViewController, CBCentralManagerDelegate {

    @IBOutlet weak var nameTextField: NSTextField!
    @IBOutlet weak var welcomLabel: NSTextField!
    
    @IBAction func handleWelcom(sender: AnyObject) {
        welcomLabel.stringValue = "Hello \(nameTextField.stringValue)!"
    }
    
    private var centralManager: CBCentralManager?
    
    override func viewDidLoad() {
        super.viewDidLoad()

//        // Do any additional setup after loading the view.
//        myCentralManager =
//            [[CBCentralManager alloc] initWithDelegate:self queue:nil options:nil];
        
        print("let myCentralManager: CBCentralManager")
        centralManager = CBCentralManager(delegate: self, queue: nil, options: nil)
        
    }

    override var representedObject: AnyObject? {
        didSet {
        // Update the view, if already loaded.
        }
    }

    // MARK: CBCentralManagerDelegate
    func centralManagerDidUpdateState(central: CBCentralManager!) {
        log("Start")
        log("central.state  :   \(central.state.rawValue)")
        switch (central.state) {
        case CBCentralManagerState.PoweredOff:
//            self.clearDevices()
            break
        case CBCentralManagerState.Unauthorized:
            // Indicate to user that the iOS device does not support BLE.
            break
            
        case CBCentralManagerState.Unknown:
            // Wait for another event
            break
            
        case CBCentralManagerState.PoweredOn:
//            self.startScanning()
            centralManager!.scanForPeripheralsWithServices(nil, options: nil)
            break
        case CBCentralManagerState.Resetting:
//            self.clearDevices()
            break
        case CBCentralManagerState.Unsupported:
            break
        }
    }
    
    func centralManager(central: CBCentralManager, didDiscoverPeripheral peripheral: CBPeripheral, advertisementData: [String : AnyObject], RSSI: NSNumber) {
        log("Start")
        log("peripheral.name  :   \(peripheral.name)")
    }
    
    // MARK: Util
    func log(logMessage: String, functionName: String = #function) {
        print("\(functionName): \(logMessage)")
    }

}

