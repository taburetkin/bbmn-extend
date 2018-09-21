import fake from './fake.js';

let session = (typeof sessionStorage === 'undefined') 
	? fake : sessionStorage;

let local = (typeof localStorage === 'undefined') 
	? fake : localStorage;

export {
	session,
	local
};
