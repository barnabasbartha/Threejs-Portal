import {EventStatus} from '../event.model';

export interface KeyEvent {
   status: EventStatus;
   key: string;
}

export const leftMouseKey = "0";
export const middleMouseKey = "1";
export const rightMouseKey = "2";
