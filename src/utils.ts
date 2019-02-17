
export function compare_arrays<T>(a: T[], b: T[], cmp: (arg0: T, arg1: T)=>boolean, sort: (arg0: T,arg1: T)=>number) {
    // return false if arrays are different.
    // different length means different arrays.
    if(a.length!==b.length) {
        return false;
    }
    // sort arrays to compare elements rather than order
    a = a.slice().sort(sort);
    b = b.slice().sort(sort);
    // now compare each element. if any element is different,
    // return false.
    for(let i=0;i<a.length;i++) {
        if(!cmp(a[i],b[i])) {
            return false;
        }
    }
    // we didn't return false, so return true instead.
    return true;
}