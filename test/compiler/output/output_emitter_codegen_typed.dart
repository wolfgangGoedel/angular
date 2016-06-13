import 'output_emitter_util.dart' as import0;
import 'package:angular2/src/facade/exceptions.dart' as import1;
import 'package:angular2/src/facade/async.dart' as import2;
import 'package:angular2/src/core/linker/view_type.dart' as import3;

// This is a comment
class DynamicClass extends import0.ExternalClass {
  dynamic dynamicProp;
  dynamic dynamicChangeable;
  Function closure;
  DynamicClass(dynamic dataParam, dynamic dynamicPropParam) : super(dataParam) {
    this.dynamicProp = dynamicPropParam;
    this.dynamicChangeable = dynamicPropParam;
    this.closure = (dynamic param) {
      return {
        'param': param,
        'data': this.data,
        'dynamicProp': this.dynamicProp
      };
    };
  }
  Map<String, dynamic> get dynamicGetter {
    return {'data': this.data, 'dynamicProp': this.dynamicProp};
  }

  dynamic dynamicMethod(dynamic param) {
    return {'param': param, 'data': this.data, 'dynamicProp': this.dynamicProp};
  }
}

dynamic getExpressions() {
  var readVar = 'someValue';
  var changedVar = 'initialValue';
  changedVar = 'changedValue';
  var map = {'someKey': 'someValue', 'changeable': 'initialValue'};
  map['changeable'] = 'changedValue';
  var externalInstance = new import0.ExternalClass('someValue');
  externalInstance.changeable = 'changedValue';
  dynamic fn = (param) {
    return {'param': param};
  };
  var throwError = () {
    throw new import1.BaseException('someError');
  };
  dynamic catchError = (runCb) {
    try {
      runCb();
    } catch (error, stack) {
      return [error, stack];
    }
  };
  var dynamicInstance = new DynamicClass('someValue', 'dynamicValue');
  dynamicInstance.dynamicChangeable = 'changedValue';
  return {
    'stringLiteral': 'Hello World!',
    'intLiteral': 42,
    'boolLiteral': true,
    'arrayLiteral': [0],
    'mapLiteral': {'key0': 0},
    'readVar': readVar,
    'changedVar': changedVar,
    'readKey': map['someKey'],
    'changedKey': map['changeable'],
    'readPropExternalInstance': externalInstance.data,
    'readPropDynamicInstance': dynamicInstance.dynamicProp,
    'readGetterDynamicInstance': dynamicInstance.dynamicGetter,
    'changedPropExternalInstance': externalInstance.changeable,
    'changedPropDynamicInstance': dynamicInstance.dynamicChangeable,
    'invokeMethodExternalInstance': externalInstance.someMethod('someParam'),
    'invokeMethodExternalInstanceViaBind':
        externalInstance.someMethod('someParam'),
    'invokeMethodDynamicInstance': dynamicInstance.dynamicMethod('someParam'),
    'invokeMethodDynamicInstanceViaBind':
        dynamicInstance.dynamicMethod('someParam'),
    'concatedArray': [0]..addAll([1]),
    'fn': fn,
    'closureInDynamicInstance': dynamicInstance.closure,
    'invokeFn': fn('someParam'),
    'conditionalTrue': ((''.length == 0) ? 'true' : 'false'),
    'conditionalFalse': ((''.length != 0) ? 'true' : 'false'),
    'not': !false,
    'externalTestIdentifier': import0.ExternalClass,
    'externalSrcIdentifier': import2.EventEmitter,
    'externalEnumIdentifier': import3.ViewType.HOST,
    'externalInstance': externalInstance,
    'dynamicInstance': dynamicInstance,
    'throwError': throwError,
    'catchError': catchError,
    'operators': {
      '==': (a, b) {
        return (a == b);
      },
      '!=': (a, b) {
        return (a != b);
      },
      '===': (a, b) {
        return identical(a, b);
      },
      '!==': (a, b) {
        return !identical(a, b);
      },
      '-': (a, b) {
        return (a - b);
      },
      '+': (a, b) {
        return (a + b);
      },
      '/': (a, b) {
        return (a / b);
      },
      '*': (a, b) {
        return (a * b);
      },
      '%': (a, b) {
        return (a % b);
      },
      '&&': (a, b) {
        return (a && b);
      },
      '||': (a, b) {
        return (a || b);
      },
      '<': (a, b) {
        return (a < b);
      },
      '<=': (a, b) {
        return (a <= b);
      },
      '>': (a, b) {
        return (a > b);
      },
      '>=': (a, b) {
        return (a >= b);
      }
    }
  };
}
