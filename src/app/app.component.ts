import { Component, OnInit } from "@angular/core";
import Konva from "konva";
import { delay } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "Control-Signal-Flow";
  stage!: Konva.Stage;
  layer!: Konva.Layer;
  x!: number;
  y!: number;
  shapes: Konva.Group[] = [];
  connecting: boolean = false;
  node1!: Konva.Shape;
  node2!: Konva.Shape;
  xToNodeMap = new Map<Number, String>();
  letterToIndex = new Map<String, Number>();
  graph: Number[][] = [[0]];
  NodeOneSelected: boolean = false;
  insertNode: boolean = false;
  // loops: number[][] = [];
  count: number = 0;
  ngOnInit(): void {
    document.documentElement.style.setProperty("--wbCursor", "crosshair");
    this.stage = new Konva.Stage({
      height: 1400,
      width: 1600,
      container: "konva-holder",
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }
  drawNode() {
    this.insertNode = true;
  }
  Circle() {
    this.count++;
    const circle = new Konva.Circle({
      x: this.stage.getPointerPosition()?.x,
      y: this.stage.getPointerPosition()?.y,
      radius: 30,
      fill: "red",
      stroke: "black",
      strokeWidth: 4,
    });
    let Str: String = String.fromCharCode(65 + this.shapes.length);
    let key: Number = this.stage.getPointerPosition()?.x as number;
    const label = new Konva.Text({
      x: (this.stage.getPointerPosition()?.x as number) - 10,
      y: (this.stage.getPointerPosition()?.y as number) - 10,
      text: String.fromCharCode(65 + this.shapes.length),
      fontSize: 20,
      fill: "white",
    });
    this.xToNodeMap.set(key, Str);
    this.letterToIndex.set(Str, Str.charCodeAt(0) - 65);
    console.log(this.xToNodeMap);
    console.log(circle);
    const group = new Konva.Group();
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

  MouseDownHandler() {
    this.stage.on("click", (e) => {
      if (
        e.target instanceof Konva.Circle &&
        this.connecting &&
        !this.insertNode
      ) {
        if (this.NodeOneSelected) {
          this.NodeOneSelected = false;
          this.node2 = e.target;

          (<HTMLDivElement>(
            document.getElementById("light-blocker")
          )).style.display = "block";
          (<HTMLDivElement>document.getElementById("popup")).style.display =
            "flex";
          (<HTMLDivElement>(
            document.getElementById("popup")
          )).style.flexDirection = "row";
          (<HTMLDivElement>(
            document.getElementById("popup")
          )).style.justifyContent = "space-between";
          this.connecting = false;
        } else {
          this.node1 = e.target;
          this.NodeOneSelected = true;
          this.stage.removeEventListener("click");
        }
      } else if (this.insertNode) {
        this.Circle();
        this.insertNode = false;
      }
    });
  }

  connect() {
    this.connecting = true;
    this.insertNode = false;
  }

  drawLine(gain: Number) {
    var x1 = this.node1.x();
    var x2 = this.node2.x();
    var y1 = this.node1.y();
    var y2 = this.node2.y();
    var controlX = 0;
    var controlY = 0;
    var isFeedBack: boolean = false;
    var index1: Number = Number(
      this.letterToIndex.get(String(this.xToNodeMap.get(this.node1.x())))
    );
    var index2: Number = Number(
      this.letterToIndex.get(String(this.xToNodeMap.get(this.node2.x())))
    );
    if (
      x2 > x1 &&
      this.graph[Number(index1)][Number(index2)] == 0 &&
      Math.abs(Number(index1) - Number(index2)) <= 1
    ) {
      x1 += 30;
      x2 -= 30;
      controlX = x1;
      controlY = y1;
    } else if (x2 == x1 && y2 == y1) {
      controlX = x1;
      controlY = y1 + 75;
      x1 -= 30;
      x2 += 30;
    } else {
      y1 += 30;
      y2 += 30;
      controlX = (x1 + x2) / 2;
      controlY = y2 + 60;
      isFeedBack = true;
    }

    var line = new Konva.Arrow({
      points: [x1, y1, controlX, controlY, x2, y2],
      tension: 1,
      stroke: "black",
      strokeWidth: 2,
    });
    var Xgain = (x1 + x2) / 2;
    var Ygain = (this.stage.getPointerPosition()?.y as number) - 10;
    if (isFeedBack) {
      Ygain += 100;
    }
    const label = new Konva.Text({
      x: Xgain,
      y: Ygain,
      text: String(gain),
      fontSize: 20,
      fill: "black",
    });
    const group = new Konva.Group();
    group.add(line);
    group.add(label);
    this.layer.add(group).batchDraw;
    this.stage.add(this.layer);
    let srcNode = this.xToNodeMap.get(this.node1.x() as Number) as String;
    let destNode = this.xToNodeMap.get(this.node2.x() as Number) as String;
    let srcNum = this.letterToIndex.get(srcNode) as number;
    let destNum = this.letterToIndex.get(destNode) as number;

    if (this.graph[srcNum][destNum] != 0)
      //if edge already exists then sum up the gains (summation point)
      this.graph[srcNum][destNum] =
        this.graph[srcNum][destNum].valueOf() + gain.valueOf();
    else this.graph[srcNum][destNum] = gain;

    console.log(this.graph);
  }

  takeGain() {
    let gain = (<HTMLInputElement>document.getElementById("gainField")).value;
    (<HTMLDivElement>document.getElementById("light-blocker")).style.display =
      "none";
    (<HTMLDivElement>document.getElementById("popup")).style.display = "none";
    if (Number(gain) == 0) this.drawLine(1);
    else this.drawLine(Number(gain));
  }

  //-----------solve part---------------------------
  startNode: String = "";
  endNode: String = "";
  forwardPaths: string[] = [];
  forwardPathToGainMap = new Map<String, Number>();
  visitedSet = new Set<String>();
  deltai: number[] = [];
  delta: number = 1;
  cycles: number[][] = [[]];
  CycleGains: number[] =[]; 

  solve() {
    if (this.graph.length == 0) return;
    this.getForwardPaths();
    this.cycles = this.findAllCycles(this.graph as number[][]);
    this.getCycleGains();
  }

  getForwardPaths() {
    //i supposed that the source node is A and the dest is the furthest letter
    this.startNode = String.fromCharCode(65 + 0);
    this.endNode = String.fromCharCode(65 + this.graph.length - 1);
    console.log(this.startNode);
    console.log(this.endNode);
    this.getForwardPathsRecursively(String(this.startNode), "");
    console.log("f.p is ", this.forwardPaths);
    this.constructForwardGains();
  }

  getForwardPathsRecursively(node: string, currentPath: string) {
    if (node == this.endNode) return currentPath + this.endNode;
    this.visitedSet.add(node);
    currentPath += node;
    let indexOfNode = this.letterToIndex.get(node);
    for (
      let i = Number(indexOfNode) + 1;
      i < this.graph[Number(indexOfNode)].length;
      i++
    ) {
      if (
        this.graph[Number(indexOfNode)][i] != 0 &&
        !this.visitedSet.has(String.fromCharCode(65 + i))
      ) {
        let str = this.getForwardPathsRecursively(
          String.fromCharCode(65 + i),
          currentPath
        );
        if (str.includes(String(this.endNode), 0)) {
          this.forwardPaths.push(str);
        }
      }
    }
    this.visitedSet.delete(node);
    return "";
  }

  constructForwardGains() {
    for (let str of this.forwardPaths) {
      let gain = 1;
      for (let i = 0; i < str.length - 1; i++) {
        let j = i + 1;
        let index1 = this.letterToIndex.get(String(str[i])) as Number;
        let index2 = this.letterToIndex.get(String(str[j])) as Number;
        gain =
          gain.valueOf() *
          this.graph[index1.valueOf()][index2.valueOf()].valueOf();
      }
      this.forwardPathToGainMap.set(str, gain);
    }
    console.log(this.forwardPathToGainMap);
  }

  findAllCycles(graph: number[][]) {
    const cycles: number[][] = [];
    const visited: number[] = [];
    let stack: number[] = [];
  
    function dfs(node: number, start: number) {
      visited[node] = 1;
      stack.push(node);
  
      for (let i = 0; i < graph.length; i++) {
        if (graph[node][i]) {
          if (!visited[i]) {
            dfs(i, start);
          } else if (i === start) {
            stack.push(i);
            let flag : boolean = true;
            for(let k=1 ; k<stack.length ; k++){
              if(stack[0] > stack[k]){
                flag = false;break;
              }

            }
            if(flag){
              cycles.push([...stack]);
            }
            stack.pop();
          }
        }
      }
  
      stack.pop();
      visited[node] = 0;
    }
  
    for (let i = 0; i < graph.length; i++) {
      dfs(i, i);
    }
    console.log(cycles);
    return cycles;
  }
  
  getCycleGains(){
    this.CycleGains = new Array(this.cycles.length).fill(1);
    for(let i=0; i<this.cycles.length; i++){
      for(let j=0; j<this.cycles[i].length-1; j++){
          this.CycleGains[i] *= this.graph[this.cycles[i][j]][this.cycles[i][j+1]] as number;
      }
    }
    console.log(this.CycleGains);
  }
  getDelta(){

  }
  transferfunction(){
    let sum = 0;
    for(let i=0; i<this.forwardPaths.length; i++){
      sum += (this.forwardPathToGainMap.get(this.forwardPaths[i]) as number)* this.deltai[i];
    }
    console.log(sum/this.delta);
  }
  
}



