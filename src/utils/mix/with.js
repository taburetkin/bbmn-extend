

import normalizeArguments from './normalize-arguments';

export default function withMethod(...args) {
    
    let mixins = normalizeArguments(args, this.options);
    let Mixed = this.class;
    if(!mixins.length) return Mixed;
    else
        return _.reduce(mixins, (Memo, Ctor) => Ctor(Memo), Mixed);

}