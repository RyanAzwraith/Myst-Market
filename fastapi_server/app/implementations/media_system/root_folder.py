from __future__ import annotations

import mimetypes
from pathlib import Path
from secrets import token_hex

from app.core.exceptions import ContentNotFoundException
from app.interfaces.media_system import MediaSystem


class RootFolder(MediaSystem):
    _media_directories = frozenset({"product", "sale"})

    def __init__(
        self,
        root: str | Path | None = None,
    ):
        self.root = (
            Path(root).expanduser().resolve()
            if root is not None
            else Path(__file__).resolve().parents[4] / "media"
        )
        self.root.mkdir(parents=True, exist_ok=True)

    async def create(
        self,
        content: bytes,
        original_name: str,
        directory: str | None = None,
    ) -> str:
        file_name = self._file_name(original_name)
        directory_path = self._directory_path(directory)
        directory_path.mkdir(parents=True, exist_ok=True)

        path = directory_path / file_name
        while path.exists():
            file_name = self._file_name(original_name)
            path = directory_path / file_name

        path.write_bytes(content)
        return self._relative_path(path)

    def get(self, path: str) -> tuple[Path, str]:
        resolved_path = self._resolve_path(path)
        if not resolved_path.is_file():
            raise ContentNotFoundException(
                "Media file not found",
                details={"path": path},
            )
        return (
            resolved_path,
            mimetypes.guess_type(resolved_path.name)[0]
            or "application/octet-stream",
        )

    def exists(self, path: str) -> bool:
        return self._resolve_path(path).is_file()

    def list(self, directory: str | None = None) -> list[str]:
        directory_path = self._directory_path(directory)
        if not directory_path.is_dir():
            return []

        paths = (
            path
            for path in directory_path.iterdir()
            if path.is_file()
        )
        return sorted(self._relative_path(path) for path in paths)

    def delete(self, path: str) -> None:
        resolved_path = self._resolve_path(path)
        if not resolved_path.is_file():
            raise ContentNotFoundException(
                "Media file not found",
                details={"path": path},
            )
        resolved_path.unlink()

    def cleanup(self) -> None:
        from app.core.implementations import get_database

        database = get_database()
        session_generator = database.session_factory()
        session = next(session_generator)
        try:
            media = database.with_session(session).media.get_all()
        finally:
            session_generator.close()

        expected_paths = {
            self._media_path_from_detail(item)
            for item in media
        }
        for directory in self._media_directories:
            directory_path = self.root / directory
            if not directory_path.is_dir():
                continue
            for path in directory_path.rglob("*"):
                if not path.is_file():
                    continue
                relative_path = self._relative_path(path)
                if relative_path in expected_paths:
                    continue
                path.unlink()
                print(
                    "Removed media file without database metadata: "
                    f"{relative_path}"
                )

    @staticmethod
    def _file_name(original_name: str) -> str:
        original_path = Path(original_name)
        if not original_name or original_path.name != original_name:
            raise ValueError(
                "Media filename must not contain a path"
            )

        suffix = original_path.suffix.lower()
        if not suffix or len(suffix) > 10:
            raise ValueError(
                "Media files must have a valid extension"
            )
        if not suffix[1:].isalnum():
            raise ValueError(
                "Media files must have a valid extension"
            )
        return f"{token_hex(16)}{suffix}"

    def _directory_path(self, directory: str | None) -> Path:
        if directory is None or directory == "":
            return self.root
        return self._resolve_path(directory, allow_directory=True)

    def _resolve_path(
        self,
        path: str,
        allow_directory: bool = False,
    ) -> Path:
        if not path:
            raise ValueError("Media path must not be empty")

        candidate = Path(path)
        if candidate.is_absolute():
            raise ValueError("Media path must be relative")

        resolved_path = (self.root / candidate).resolve()
        try:
            resolved_path.relative_to(self.root)
        except ValueError as exc:
            raise ValueError(
                "Media path must remain within the root folder"
            ) from exc

        if allow_directory:
            return resolved_path
        return resolved_path

    def _relative_path(self, path: Path) -> str:
        return path.resolve().relative_to(self.root).as_posix()

    @staticmethod
    def _media_path_from_detail(media: object) -> str:
        entity_type = getattr(media.entity_type, "value", media.entity_type)
        file_name = media.media_url.rstrip("/").rsplit("/", 1)[-1]
        return f"{entity_type}/{file_name}"