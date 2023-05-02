import {Injectable} from '@angular/core';
import {generate} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PowerSetService {

    list: { array: number[], index: number }[] = [];
    tempList: { array: number[], index: number }[] = [];
    subSets: { array: number[], index: number }[] [] = [];

    public generateSubsetsRecursive(index: number): void {
        if (index == this.list.length){
            this.subSets.push([...this.tempList]);
            return;
        }

        this.generateSubsetsRecursive(index+1);
        this.tempList.push(this.list[index]);
        this.generateSubsetsRecursive(index+1);
        this.tempList.pop();
    }

    constructor() {}


}
