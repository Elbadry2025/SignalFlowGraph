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
  map2 = new Map<String, Number>();
  graph: Number[][] =[[0]];
  NodeOneSelected: boolean = false;
  insertNode: boolean = false;
  count: number = 0;
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
    this.count++;
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
    this.map2.set(Str, Str.charCodeAt(0) -65);
    console.log(this.myMap);
    console.log(circle);
    const group = new Konva.Group;
    group.add(circle);
    group.add(label);

    this.layer.add(group).batchDraw;
    this.shapes.push(group);
    this.stage.add(this.layer);
    while (this.graph.length < this.count) {
      this.graph.push(Array(this.graph[0].length).fill(0));
    }
    
    // Add new columns to the array as needed
    while (this.graph[0].length < this.count) {
      for (let i = 0; i < this.graph.length; i++) {
        if (this.graph[i][this.graph[0].length] === undefined) {
          this.graph[i].push(0);
        }
      }
    }
  }

  MouseDownHandler(){
    console.log("HIII");
    this.stage.on("click", (e) => {
      if(e.target instanceof Konva.Circle && this.connecting && !this.insertNode){
        if(this.NodeOneSelected){
          this.NodeOneSelected = false;
          this.node2 = e.target;
         
          (<HTMLDivElement>document.getElementById("light-blocker")).style.display = 'block';
          (<HTMLDivElement>document.getElementById("popup")).style.display = 'flex';
          (<HTMLDivElement>document.getElementById("popup")).style.flexDirection = 'row';
          (<HTMLDivElement>document.getElementById("popup")).style.justifyContent = 'space-between';
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

  drawLine(gain:Number){
    var x1 = this.node1.x();
    var x2 = this.node2.x();
    var y1 = this.node1.y();
    var y2 = this.node2.y();
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
      text: String(gain),
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
    let srcNum = this.map2.get(srcNode) as number;
    let destNum = this.map2.get(destNode) as number;
    this.graph[srcNum][destNum] = gain;
    for (let i = 0; i < this.graph.length; i++) {
      for (let j = 0; j < this.graph.length; j++) {
        console.log(this.graph[i][j]);
      }
    }
  }
  
  takeGain(){
    let gain = (<HTMLInputElement>document.getElementById("gainField")).value;
    (<HTMLDivElement>document.getElementById("light-blocker")).style.display = 'none';
    (<HTMLDivElement>document.getElementById("popup")).style.display = 'none';
    this.drawLine(Number(gain));
    if(Number(gain) == 0)this.drawLine(1);
    else this.drawLine(Number(gain));
  }

}
