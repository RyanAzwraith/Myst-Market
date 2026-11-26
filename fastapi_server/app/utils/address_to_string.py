def address_to_string(address_entity):
    return (
        f"{address_entity.street}, "
        f"{address_entity.city}, "
        f"{address_entity.state}, "
        f"{address_entity.postcode}, "
        f"{address_entity.country_code}"
    )