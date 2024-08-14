//This is the main file that has all of the main code

// import libraries
import java.awt.Frame;
import java.awt.BorderLayout;
import controlP5.*; // http://www.sojamo.de/libraries/controlP5/
import processing.serial.*;
import java.awt.event.KeyEvent;
import java.io.IOException;
import java.time.*;
import java.time.format.*;
import java.time.Duration;
import java.time.Instant;
import java.text.DecimalFormat;
import java.time.temporal.ChronoUnit;
/* SETTINGS BEGIN */

// Serial port to connect to
String serialPortName = "/dev/tty.usbmodem1411";

// If you want to debug the plotter without using a real serial port set this to true
boolean mockupSerial = true;
import java.util.Arrays;

/* SETTINGS END */

Serial serialPort; // Serial port object

// interface stuff
ControlP5 cp5;

// Settings for the plotter are saved in this file
JSONObject plotterConfigJSON;

// real plots & values 
int SPEED = 100; //You can adjust the time and the graph's length using this variable
Graph GyroLineGraph = new Graph(100, 70, 175, 125, color(20,20,200));
//Accel
Graph AccelLineGraph = new Graph(430, 70 ,175, 125, color(20,20,200));
//Body Orientation
Graph BodyOLineGraphX = new Graph(760, 70 ,175, 125, color(20,20,200));
Graph BodyOLineGraphY = new Graph(1090, 70 ,175, 125, color(20,20,200));
Graph BodyOLineGraphZ = new Graph(1420, 70 ,175, 125, color(20,20,200));
//Altitude
Graph AltiLineGraph = new Graph (100, 570, 175, 125, color(20,20,200));
//Temperature
Graph TempLineGraph = new Graph( 100, 820, 175, 125, color(20,20,200));
//Pressure
Graph PresLineGraph = new Graph(1420 ,70,175,125, color(20,20,200));

//Logo Import
PImage logo;

//Varaible Declaration
float[][] gyroLineValue = new float[3][SPEED];
float[] time = new float[100];
float[][] accelLineValueX = new float[3][SPEED];
float[][] accelLineValueY = new float[3][SPEED];
float[][] accelLineValueZ = new float[3][SPEED];
float[][] altiLineValue = new float[3][SPEED];
float[][] tempLineValue = new float[3][SPEED];
float[][] presLineValue = new float[3][SPEED];
color[] graphColors = new color[3];
// helper for saving the executing path
String topSketchPath = "";

float altidata = 0.0;
float tempdata = 0.0;

void setup() {
  surface.setTitle("UNASTELLA Visualizer");
  logo = loadImage("logo.png");
  logo.resize(150,0);
  

  fullScreen();
  
  // set line graph colors
  graphColors[0] = color(131, 255, 20);
  graphColors[1] = color(232, 158, 12);
  graphColors[2] = color(255, 0, 0);

  // settings save file
  topSketchPath = sketchPath();
  plotterConfigJSON = loadJSONObject(topSketchPath+"/plotter_config.json");

  // gui
  cp5 = new ControlP5(this);
  
  // init charts
  setChartSettings();
  // build x axis values for the line graph
  for (int i=0; i<gyroLineValue.length; i++) {
    for (int k=0; k<gyroLineValue[0].length; k++) {
      gyroLineValue[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  for (int i=0; i<accelLineValueX.length; i++) {
    for (int k=0; k<accelLineValueX[0].length; k++) {
      accelLineValueX[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  // build x axis values for the line graph
  for (int i=0; i<accelLineValueY.length; i++) {
    for (int k=0; k<accelLineValueY[0].length; k++) {
      accelLineValueY[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  for (int i=0; i<accelLineValueZ.length; i++) {
    for (int k=0; k<accelLineValueZ[0].length; k++) {
      accelLineValueZ[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  // build x axis values for the line graph
  for (int i=0; i<altiLineValue.length; i++) {
    for (int k=0; k<altiLineValue[0].length; k++) {
      altiLineValue[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  for (int i=0; i<tempLineValue.length; i++) {
    for (int k=0; k<tempLineValue[0].length; k++) {
      tempLineValue[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  
  // build x axis values for the line graph
  for (int i=0; i<presLineValue.length; i++) {
    for (int k=0; k<presLineValue[0].length; k++) {
      presLineValue[i][k] = 0;
      if (i==0)
        time[k] = k;
    }
  }
  // start serial communication
  if (!mockupSerial) {
    //String serialPortName = Serial.list()[3];
    serialPort = new Serial(this, serialPortName, 115200);
    serialPort.bufferUntil('\n');
  }
  else
    serialPort = null;
 
}

byte[] inBuffer = new byte[100]; // holds serial message
int i = 0; // loop variable

void updateGraphSize(Graph graphName , float graphIndex){
  if (graphIndex >= graphName.yMax){
    graphName.yMax = graphIndex;
  } else if (graphIndex <= graphName.yMin) {
    graphName.yMin = graphIndex;
  }
}

void displayStatusBox(){
  int systemState = 0;
  
  stroke(240);
  strokeWeight(1);
  rect(5, 260, 325, 245);
  
  
  if (mockupSerial || serialPort.available() >0){
   if (systemState == 0){
     fill(65, 65, 65); // Waiting for data
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Waiting for Data", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   } else if (systemState == 1){
     fill(190, 190, 0); // Ground Idle state
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Ground Idle State", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   } else if (systemState == 3){
     fill(0, 76,153); //Ready for launch
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Ready For Launch", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   } else if (systemState == 4){
     fill(0, 153,0); //Powered Ascent
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Powered Ascent", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   }
   else if (systemState == 5){
     fill(76, 0,153); //Burnout/Coast
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Burnout/Coast", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   } else if (systemState == 6){
     fill(153, 76,0); //Parachute Deployment
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Parachute Deployment", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   }else if (systemState == 7){
     fill(204, 0,102); //TouchDown
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("Touchdown", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   } else if (systemState == 99){
     fill(255, 51,51); //Abort/FTS
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("ABORT/FTS", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
   }else{
     fill(0, 0,0); //NO DATA RECIEVED
     int rectX = 17;
     int rectY = 275;
     int rectWidth = 300;
     int rectHeight = 60;
     rect(17.5, 275, 300, 60, 5 , 5, 5, 5);
     fill(255,255,255);
     textAlign(CENTER, CENTER);
     textSize(25);
     text("DATA STALE", rectX+ rectWidth/2, rectY -5 + rectHeight/2); 
  }
  }
  
}

void displayBaseInformation(){

 image(logo, width - logo.width - (width * 0.001), height * 0.02);
 textSize(18);
 
 //Time
 LocalDate date = LocalDate.now();
 LocalTime time = LocalTime.now();
 DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss:SSS");
 //GCT (Program Run Time)
 int elapsedTime = millis();
 int hours = elapsedTime / (1000 *60*60);
 int minutes = (elapsedTime / (1000*60)) % 60;
 int seconds = (elapsedTime / 1000) % 60;
 int milliseconds = elapsedTime % 1000;
 String timeStr = String.format("%02d:%02d:%02d.%03d", hours, minutes, seconds, milliseconds);
 //VOT (Vehicle On Time)
 Instant startTime = null;
 DecimalFormat threeDigitFormat = new DecimalFormat("000");
 
 if (mockupSerial || serialPort.available() > 0){
  if (startTime == null){
   startTime = Instant.now(); 
   
   Duration duration = Duration.between(startTime, Instant.now());
   
   String timeFormatted = String.format("%02d:%02d:%02d.%s", 
   duration.toHours(),
   duration.toMinutesPart(),
   duration.toSecondsPart(),
   threeDigitFormat.format(duration.toMillisPart()));
   
   text("VOT: "+ timeFormatted, width - (width *0.01), height *0.2);// (Vehicle On Time)
  }
 } else {
   text("VOT: 00:00:00.000", width - (width *0.01), height *0.2); // (Vehicle On Time)
 }
 text("Ground Control SW", width - (width* 0.01), height *0.125);
 text("Date: " +date, width - (width* 0.01), height *0.150);
 text("CLT: " + time.format(formatter), width - (width* 0.01), height *0.175); // (Current Local Time)
 
 text("GCT: " + timeStr, width - (width * 0.01), height *0.225); // (Ground Control Time)
 
}

void displayRawData(){
  
}

public float maxNumber(float[][] graphValue) {
        /*float maxValue = graphValue[2][0];
        
          
            for (int i = 0; i < graphValue[2].length-1; i++) {
                if (graphValue[2][i] > maxValue) {
                    maxValue = graphValue[2][i];
                }
            }*/
          float maximum = Float.MIN_VALUE;
        float minimum = Float.MAX_VALUE;
        float[][] copy = Arrays.copyOf(graphValue, graphValue.length);

            for(int i = 0; i < copy.length; i++) {
             
             
             
            Arrays.sort(copy[i]);

            if(copy[i][0] < minimum) minimum = copy[i][0];
            if(copy[i][copy[i].length - 1] > maximum) maximum = copy[i][copy[i].length - 1];
        }
        
        return maximum;
}

void draw() {
  /* Read serial and update values */
  
  if (mockupSerial || serialPort.available() > 0) {
    String myString = "";
    if (!mockupSerial) {
      try {
        serialPort.readBytesUntil('\r', inBuffer);
      }
      catch (Exception e) {
      }
      myString = new String(inBuffer);
    }
    else {
      myString = mockupSerialFunction();
    }
    
    //println(myString);

    // split the string at delimiter (space)
    String[] nums = split(myString, ' ');
    
    // count number of bars and line graphs to hide
    int numberOfInvisibleBars = 0;
    for (i=0; i<6; i++) {
      if (int(getPlotterConfigString("bcVisible"+(i+1))) == 0) {
        numberOfInvisibleBars++;
      }
    }
    int numberOfInvisibleLineGraphs = 0;
    for (i=0; i<6; i++) {
      if (int(getPlotterConfigString("lgVisible"+(i+1))) == 0) {
        numberOfInvisibleLineGraphs++;
      }
    }
  

    // build the arrays for bar charts and line graphs
    int barchartIndex = 0;
    for (i=0; i<nums.length; i++) {

       //gyroLineValue
      try {
        if (i<gyroLineValue.length) {
          for (int k=0; k<gyroLineValue[i].length-1; k++) {
            gyroLineValue[i][k] = gyroLineValue[i][k+1];
          }
          updateGraphSize(GyroLineGraph, gyroLineValue[i][gyroLineValue[i].length-1]);
          gyroLineValue[i][gyroLineValue[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
  
        }
      }
      catch (Exception e) {
      }
      //accelLineValueX
      try {
        if (i<accelLineValueX.length) {
          for (int k=0; k<accelLineValueX[i].length-1; k++) {
            accelLineValueX[i][k] = accelLineValueX[i][k+1];
          }
          //println(accelLineValueX[i][accelLineValueX[i].length-1]);
          updateGraphSize(AccelLineGraph, accelLineValueX[i][accelLineValueX[i].length-1]);
          accelLineValueX[i][accelLineValueX[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
      }
      catch (Exception e) {
      }
      //accelLineValueY
      try {
        if (i<accelLineValueY.length) {
          for (int k=0; k<accelLineValueY[i].length-1; k++) {
            accelLineValueY[i][k] = accelLineValueY[i][k+1];
          }
          //println(accelLineValueY[i][accelLineValueY[i].length-1]);
          updateGraphSize(BodyOLineGraphX, accelLineValueY[i][accelLineValueY[i].length-1]);
          accelLineValueY[i][accelLineValueY[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
      }
      catch (Exception e) {
      }
      //accelLineValueZ
      try {
        if (i<accelLineValueZ.length) {
          for (int k=0; k<accelLineValueZ[i].length-1; k++) {
            accelLineValueZ[i][k] = accelLineValueZ[i][k+1];
          }
          //println(accelLineValueZ[i][accelLineValueZ[i].length-1]);
          updateGraphSize(BodyOLineGraphY, accelLineValueZ[i][accelLineValueZ[i].length-1]);
          accelLineValueZ[i][accelLineValueZ[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
      }
      catch (Exception e) {
      }
      //altiLineValue
      try {
         
        if (i<altiLineValue.length) {
          for (int k=0; k<altiLineValue[i].length-1; k++) {
            altiLineValue[i][k] = altiLineValue[i][k+1];
          }
          altidata = altiLineValue[i][altiLineValue[i].length-1];
          updateGraphSize(AltiLineGraph, accelLineValueZ[i][accelLineValueZ[i].length-1]);
          altiLineValue[i][altiLineValue[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
       
      }
      catch (Exception e) {
      }
      //tempLineValue
      try {
        if (i<tempLineValue.length) {
          for (int k=0; k<tempLineValue[i].length-1; k++) {
            tempLineValue[i][k] = tempLineValue[i][k+1];
          }
          //println(tempLineValue[i][tempLineValue[i].length-1]);
          tempdata = tempLineValue[i][tempLineValue[i].length-1];
          updateGraphSize(TempLineGraph, tempLineValue[i][tempLineValue[i].length-1]);
          tempLineValue[i][tempLineValue[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
      }
      catch (Exception e) {
      }
       //presLineValue
      try {
        if (i<presLineValue.length) {
          for (int k=0; k<presLineValue[i].length-1; k++) {
            presLineValue[i][k] = presLineValue[i][k+1];
          }
          //println(presLineValue[i][presLineValue[i].length-1]);
          updateGraphSize(PresLineGraph, presLineValue[i][presLineValue[i].length-1]);
          presLineValue[i][presLineValue[i].length-1] = float(nums[i])*float(getPlotterConfigString("lgMultiplier"+(i+1)));
        }
      }
      catch (Exception e) {
      }
      
    }
  }

    // draw the bar chart
  background(0); 
  
  text("Max Altitude (Apogee) in meters: " + maxNumber(altiLineValue),1000,450);
  // draw the line graphs
  GyroLineGraph.DrawAxis();
  for (int i=0;i<gyroLineValue.length; i++) {
    GyroLineGraph.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      GyroLineGraph.LineGraph(time, gyroLineValue[i]);
  }
  AccelLineGraph.DrawAxis();
  for (int i=0;i<accelLineValueX.length; i++) {
    AccelLineGraph.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      AccelLineGraph.LineGraph(time, accelLineValueX[i]);
  }
  BodyOLineGraphX.DrawAxis();
  for (int i=0;i<accelLineValueY.length; i++) {
    BodyOLineGraphX.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      BodyOLineGraphX.LineGraph(time, accelLineValueY[i]);
  }
  BodyOLineGraphY.DrawAxis();
  for (int i=0;i<accelLineValueZ.length; i++) {
    BodyOLineGraphY.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      BodyOLineGraphY.LineGraph(time, accelLineValueZ[i]);
  }
  AltiLineGraph.DrawAxis();
  for (int i=0;i<accelLineValueZ.length; i++) {
    AltiLineGraph.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      AltiLineGraph.LineGraph(time, accelLineValueZ[i]);
  }
  TempLineGraph.DrawAxis();
  for (int i=0;i<tempLineValue.length; i++) {
    TempLineGraph.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      TempLineGraph.LineGraph(time, tempLineValue[i]);
  }
  PresLineGraph.DrawAxis();
   for (int i=0;i<presLineValue.length; i++) {
    PresLineGraph.GraphColor = graphColors[i];
    if (int(getPlotterConfigString("lgVisible"+(i+1))) == 1)
      PresLineGraph.LineGraph(time, presLineValue[i]);
  }
  displayRawData();
  displayBaseInformation();
  displayStatusBox();
}

// called each time the chart settings are changed by the user 
void setChartSettings() {
  GyroLineGraph.xLabel="Time(sec)";
  GyroLineGraph.yLabel="degrees";
  GyroLineGraph.Title="Gyroscopes";    
  GyroLineGraph.yMax=10; 
  GyroLineGraph.yMin=-20;
  
  AccelLineGraph.xLabel="Time(sec)";
  AccelLineGraph.yLabel="m/s^2";
  AccelLineGraph.Title="Accelerometers";    
  AccelLineGraph.yMax=10; 
  AccelLineGraph.yMin=-20;
  
  BodyOLineGraphX.xLabel="Time(sec)";
  BodyOLineGraphX.yLabel="degrees";
  BodyOLineGraphX.Title="Body Orientation (X)";    
  BodyOLineGraphX.yMax=10; 
  BodyOLineGraphX.yMin=-20;
  
  BodyOLineGraphY.xLabel="Time(sec)";
  BodyOLineGraphY.yLabel="m/s^2";
  BodyOLineGraphY.Title="Body Orientation (Y)";    
  BodyOLineGraphY.yMax=10; 
  BodyOLineGraphY.yMin=-20;
  
  AltiLineGraph.xLabel="Time(sec)";
  AltiLineGraph.yLabel="m";
  AltiLineGraph.Title="Altitude";    
  AltiLineGraph.yMax=10; 
  AltiLineGraph.yMin=0;

  TempLineGraph.xLabel="Time(sec)";
  TempLineGraph.yLabel="°C";
  TempLineGraph.Title="Temperature";    
  TempLineGraph.yMax=10; 
  TempLineGraph.yMin=-20;
  
  PresLineGraph.xLabel="Time(sec)";
  PresLineGraph.yLabel="Pa";
  PresLineGraph.Title="Pressure";    
  PresLineGraph.yMax=10; 
  PresLineGraph.yMin=0;
}

// handle gui actions
void controlEvent(ControlEvent theEvent) {
  if (theEvent.isAssignableFrom(Textfield.class) || theEvent.isAssignableFrom(Toggle.class) || theEvent.isAssignableFrom(Button.class)) {
    String parameter = theEvent.getName();
    String value = "";
    if (theEvent.isAssignableFrom(Textfield.class))
      value = theEvent.getStringValue();
    else if (theEvent.isAssignableFrom(Toggle.class) || theEvent.isAssignableFrom(Button.class))
      value = theEvent.getValue()+"";

    plotterConfigJSON.setString(parameter, value);
    saveJSONObject(plotterConfigJSON, topSketchPath+"/plotter_config.json");
  }
  setChartSettings();
}

// get gui settings from settings file
String getPlotterConfigString(String id) {
  String r = "";
  try {
    r = plotterConfigJSON.getString(id);
  } 
  catch (Exception e) {
    r = "";
  }
  return r;
}
