

def create_singleton(create_fn):
    instance = None
    initialised = False

    def init_instance(*args, **kwargs):
        nonlocal instance, initialised

        if initialised:
            raise RuntimeError("Instance already initialised")

        instance = create_fn(*args, **kwargs)
        initialised = True
        return instance

    def get_instance():
        if not initialised:
            raise RuntimeError("Instance not initialised yet")
        return instance

    return init_instance, get_instance