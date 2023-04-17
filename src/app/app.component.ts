import { Component, OnInit } from '@angular/core';
import Konva from 'konva';
import { delay } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Control-Signal-Flow';
  stage!: Konva.Stage;
  layer!: Konva.Layer;
  x!: number;
  y!: number;
  shapes: Konva.Group[] = [];
  connecting:boolean = false;
  node1!: Konva.Shape;
  node2!: Konva.Shape;
  myMap = new Map<Number, String>();
  NodeOneSelected: boolean = false;
  insertNode: boolean = false;
  ngOnInit(): void {
    document.documentElement.style.setProperty('--wbCursor', "crosshair");
    this.stage = new Konva.Stage({
      height: 1400,
      width: 1600,
      container: "konva-holder"
    });
    this.layer = new Konva.Layer;
    this.stage.add(this.layer);
  }
  drawNode(){
    this.insertNode = true;
  }
  Circle(){
    const circle = new Konva.Circle({
      x : this.stage.getPointerPosition()?.x,
      y : this.stage.getPointerPosition()?.y,
      radius: 30,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });
    let Str:String = String.fromCharCode(65+this.shapes.length);
    let key:Number = this.stage.getPointerPosition()?.x as number;
    const label = new Konva.Text({
      x : this.stage.getPointerPosition()?.x as number -10,
      y : this.stage.getPointerPosition()?.y as number -10,
      text: String.fromCharCode(65+this.shapes.length),
      fontSize: 20,
      fill: 'white',
    });
    this.myMap.set(key,Str);
    console.log(this.myMap);
    console.log(circle);
    const group = new Konva.Group;
    group.add(circle);
    group.add(label);

    this.layer.add(group).batchDraw;
    this.shapes.push(group);
    this.stage.add(this.layer);
    
  }

  MouseDownHandler(){
    console.log("HIII");
    this.stage.on("click", (e) => {
      if(e.target instanceof Konva.Circle && this.connecting && !this.insertNode){
        if(this.NodeOneSelected){
          this.NodeOneSelected = false;
          this.node2 = e.target;
          var x1 = this.node1.x();
          var x2 = this.node2.x();
          var y1 = this.node1.y();
          var y2 = this.node2.y();
          var factorx = 0;
          var factory = 0;
          var controlX = 0;
          var controlY = 0;
          var isFeedBack:boolean = false;
          if(x2 > x1){
            x1 += 30;
            x2 -= 30;
            controlX = x1;
            controlY = y1;
          }else if(x2 == x1 && y2 == y1){
            controlX = x1;
            controlY = y1+75;
            x1 -= 30;
            x2 += 30;
          }else{
            y1+= 30;
            y2+= 30;
            controlX = (x1+x2)/2;
            controlY = y2 + 60;
            isFeedBack = true;
          }
          var line = new Konva.Arrow({
            points: [x1, y1, controlX, controlY, x2, y2],
            tension: 1,
            stroke: 'black',
            strokeWidth: 2,
          });
          var Xgain = (x1+x2) / 2;
          var Ygain = this.stage.getPointerPosition()?.y as number -10;
          if(isFeedBack){
            Ygain += 100;
          }
          const label = new Konva.Text({
            x : Xgain,
            y : Ygain,
            text: "60",
            fontSize: 20,
            fill: 'black',
          });
          const group = new Konva.Group;
          group.add(line);
          group.add(label);
          this.layer.add(group).batchDraw;
          this.stage.add(this.layer);
          let srcNode = this.myMap.get(this.node1.x() as Number) as String;
          let destNode = this.myMap.get(this.node2.x() as Number) as String;
          this.connecting = false;
        }else{
          this.node1 = e.target;
          this.NodeOneSelected = true;
          this.connecting = false;
        }
      }else if(this.insertNode){
        this.Circle();
        this.insertNode = false;
      }
    })
  }

  connect(){
    this.connecting = true;
  }
  
}
