from fastapi.routing import APIRoute

import pytest


@pytest.mark.high
class CreateApp_test:
    def functionality_test(
        self,
        create_app_module,
        configured_create_app,
        monkeypatch,
    ):
        dependencies = configured_create_app
        monkeypatch.setattr(
            create_app_module.stripe,
            "api_key",
            None,
        )
        monkeypatch.setattr(
            create_app_module.resend,
            "api_key",
            None,
        )

        application = create_app_module.create_app()

        assert isinstance(application, create_app_module.FastAPI)
        assert application.state.db is dependencies.database
        dependencies.init_config.assert_called_once_with()
        dependencies.init_logger.assert_called_once_with(
            dependencies.config.log_level,
            dependencies.config.log_to_file,
        )
        dependencies.init_media_system.assert_called_once_with(
            dependencies.config,
        )
        dependencies.init_database.assert_called_once_with(
            dependencies.config,
        )
        dependencies.init_middleware.assert_called_once_with(
            application,
            dependencies.config.cors_origins,
        )
        dependencies.init_exception_handlers.assert_called_once_with(
            application,
        )
        assert create_app_module.stripe.api_key == "stripe-test-key"
        assert create_app_module.resend.api_key == "resend-test-key"

    def registers_application_routes_test(
        self,
        create_app_module,
        configured_create_app,
    ):
        application = create_app_module.create_app()
        paths = {
            route.path
            for route in application.routes
            if isinstance(route, APIRoute)
        }

        assert "/stats" in paths
        assert "/products/search" in paths
        assert "/media/{entity_type}/{file_name}" in paths


@pytest.mark.high
class ApplicationLifespan_test:
    @pytest.mark.asyncio
    async def functionality_test(
        self,
        create_app_module,
        configured_create_app,
    ):
        dependencies = configured_create_app
        application = create_app_module.create_app()

        async with application.router.lifespan_context(application):
            pass

        dependencies.database.session_factory.assert_called_once_with()
        dependencies.database.with_session.assert_called_once_with(
            dependencies.session_generator.__next__.return_value,
        )
        dependencies.session_generator.close.assert_called_once_with()
        dependencies.database.media.cleanup.assert_called_once_with()
        dependencies.media_system.cleanup.assert_called_once_with()
        dependencies.database.engine.dispose.assert_called_once_with()
