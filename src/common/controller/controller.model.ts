import {EventStatus} from '../event.model';

export interface KeyEvent {
   status: EventStatus;
   key: string;
}
