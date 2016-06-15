export function hasLifecycleHook(e, instance) {
    return e.name in instance;
}
