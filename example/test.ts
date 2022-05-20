import { UserDto as Full } from './stripped/dto/user.dto';
import { UserDto as Stripped } from './full/dto/user.dto';

const full = new Full();

full.password = '123';

const stripped = new Stripped();

stripped.username = 'abc';


console.log('full', full);
console.log('stripped', stripped);
