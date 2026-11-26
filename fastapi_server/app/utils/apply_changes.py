def apply_changes(entity, request, fields):
    for field in fields:
        value = getattr(request, field)
        if value is not None:
            setattr(entity, field, value)
