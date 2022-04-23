import { TestDto as Full } from './full';
import { TestDto as Stripped} from './dist';

const full = new Full();

full.password = '123';

const stripped = new Stripped();

stripped.username = 'test';