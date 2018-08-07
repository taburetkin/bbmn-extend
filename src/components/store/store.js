import fake from './fake';

let session = (typeof sessionStorage === 'undefined') 
	? fake : sessionStorage;

let local = (typeof localStorage === 'undefined') 
	? fake : localStorage;

export {
	session,
	local
};
