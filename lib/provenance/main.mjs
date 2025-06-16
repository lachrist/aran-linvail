import { is } from "linvail/library";
import { log } from "node:console";

const num = 123;

log(is(num, 123)); // false

log(is(num, num)); // true

const array = [789, 456, num];

array.sort();

log(is(array.map((x) => x).toSorted()[0], num)); // true
