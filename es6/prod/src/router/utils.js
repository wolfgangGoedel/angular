import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ComponentFactory } from 'angular2/core';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { CanActivate } from './lifecycle/lifecycle_annotations_impl';
export class TouchMap {
    constructor(map) {
        this.map = {};
        this.keys = {};
        if (isPresent(map)) {
            StringMapWrapper.forEach(map, (value, key) => {
                this.map[key] = isPresent(value) ? value.toString() : null;
                this.keys[key] = true;
            });
        }
    }
    get(key) {
        StringMapWrapper.delete(this.keys, key);
        return this.map[key];
    }
    getUnused() {
        var unused = {};
        var keys = StringMapWrapper.keys(this.keys);
        keys.forEach(key => unused[key] = StringMapWrapper.get(this.map, key));
        return unused;
    }
}
export function normalizeString(obj) {
    if (isBlank(obj)) {
        return null;
    }
    else {
        return obj.toString();
    }
}
export function getComponentAnnotations(comp) {
    if (comp instanceof ComponentFactory) {
        return comp.metadata;
    }
    else {
        return reflector.annotations(comp);
    }
}
export function getComponentType(comp) {
    return comp instanceof ComponentFactory ? comp.componentType : comp;
}
export function getCanActivateHook(component) {
    var annotations = getComponentAnnotations(component);
    for (let i = 0; i < annotations.length; i += 1) {
        let annotation = annotations[i];
        if (annotation instanceof CanActivate) {
            return annotation.fn;
        }
    }
    return null;
}
