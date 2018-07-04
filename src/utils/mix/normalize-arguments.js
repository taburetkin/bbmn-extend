
export default function normalizeArguments(args, opts = {})
{
    let raw = {};
    let wrap = opts.wrapObjectWithConstructor == true;
    let merge = opts.mergeObjects == true;    
    let ctors = [];
    _(args).each(arg => {
        if (_.isFunction(arg)) {
            ctors.push(arg);
            return;
        }

        if (!_.isObject(arg)) return;

        if (!merge || (wrap && _.isFunction(arg.constructor))) {
            ctors.push(Base => Base.extend(arg));
        } else {
            _.extend(raw, arg);
        }
    });

    if(_.size(raw))
        ctors.unshift(Base => Base.extend(raw));

    return ctors;
}