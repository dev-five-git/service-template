#!/usr/bin/env python3
"""
OpenAPI JSON을 추출하는 스크립트
서버를 실행하지 않고 OpenAPI 스키마를 생성합니다.

사용법:
    python extract_openapi.py [출력파일명]

예시:
    python extract_openapi.py                    # openapi.json으로 저장
    python extract_openapi.py my-api.json       # my-api.json으로 저장
"""

import json
import sys
from pathlib import Path
from main import app


def extract_openapi(output_file="openapi.json"):
    """OpenAPI 스키마를 추출하여 JSON 파일로 저장합니다."""
    openapi_schema = app.openapi()

    # 출력 파일 경로 설정
    output_path = Path(output_file)

    # openapi.json 파일로 저장
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)

    print("✅ OpenAPI JSON 파일이 성공적으로 생성되었습니다!")
    print(f"📄 파일 위치: {output_path.absolute()}")
    print(f"📊 API 엔드포인트 수: {len(openapi_schema.get('paths', {}))}")

    # 생성된 파일 크기 표시
    file_size = output_path.stat().st_size
    print(f"📏 파일 크기: {file_size:,} bytes")


if __name__ == "__main__":
    # 명령행 인수로 출력 파일명 지정 가능
    output_file = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    extract_openapi(output_file)
