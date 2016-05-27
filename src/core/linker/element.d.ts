import { Injector } from 'angular2/src/core/di';
import { AppView } from './view';
import { ElementRef_ } from './element_ref';
import { ViewContainerRef_ } from './view_container_ref';
import { QueryList } from './query_list';
export declare class AppElement {
    index: number;
    parentIndex: number;
    parentView: AppView<any>;
    nativeElement: any;
    nestedViews: AppView<any>[];
    componentView: AppView<any>;
    private _ref;
    private _vcRef;
    component: any;
    componentConstructorViewQueries: QueryList<any>[];
    constructor(index: number, parentIndex: number, parentView: AppView<any>, nativeElement: any);
    ref: ElementRef_;
    vcRef: ViewContainerRef_;
    initComponent(component: any, componentConstructorViewQueries: QueryList<any>[], view: AppView<any>): void;
    parentInjector: Injector;
    injector: Injector;
    mapNestedViews(nestedViewClass: any, callback: Function): any[];
    attachView(view: AppView<any>, viewIndex: number): void;
    detachView(viewIndex: number): AppView<any>;
}
