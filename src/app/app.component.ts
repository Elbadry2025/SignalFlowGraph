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
  conneting:boolean = false;
  node1!: Konva.Shape;
  node2!: Konva.Shape;
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
    const label = new Konva.Text({
      x : this.stage.getPointerPosition()?.x as number -10,
      y : this.stage.getPointerPosition()?.y as number -10,
      text: String.fromCharCode(65+this.shapes.length),
      fontSize: 20,
      fill: 'white',

    });
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
      if(e.target instanceof Konva.Circle && this.conneting && !this.insertNode){
        if(this.NodeOneSelected){
          this.NodeOneSelected = false;
          this.node2 = e.target;
          var x1 = this.node1.x();
          var x2 = this.node2.x();
          var y1 = this.node1.y();
          var y2 = this.node2.y();
          var factorx = 0;
          var factory = 0;
          if(Math.abs(x1-x2)<20){
            x1-=30;
            factory = Math.abs(y2-y1)/6;
          }else{
            factorx= Math.abs(x2-x1)/6;
          }
          var line = new Konva.Line({
            points: [x1,y1,(x1+x2)/2-factorx,(y1+y2)/2-factory,x2,y2],
            tension: 1,
            stroke: 'black',
            strokeWidth: 2,
        });
        this.layer.add(line).batchDraw;
        this.stage.add(this.layer);
        this.conneting = false;
        }else{
          this.node1 = e.target;
          this.NodeOneSelected = true;
          this.conneting = false;
        }
      }else if(this.insertNode){
        this.Circle();
        this.insertNode = false;
      }
    })
  }

connect(){
  this.conneting = true;
}

  
}
