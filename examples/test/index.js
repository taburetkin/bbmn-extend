var compare = bbmn.utils.compareObjects;

console.log({},{}, compare({},{}));
console.log({},[], compare({},[]));
console.log({a:1},{a:1}, compare({a:1},{a:1}));

window.compare = compare;
window.merge = bbmn.utils.mergeObjects;
