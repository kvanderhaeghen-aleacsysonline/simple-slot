import { SlotMachine } from "./views/game";

export interface IProject {
    launch(): void;
}

export class Project implements IProject {
    public launch(): void {
        const slotMachine: SlotMachine = new SlotMachine();
        slotMachine.init();
        slotMachine.update();
    }
}
