from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """
    JSON入出力をcamelCaseに統一するための基底クラス。
    フロントエンド(TypeScript/camelCase)とバックエンド(Python/snake_case)の
    キー変換をエージェントごとにバラバラに実装させないための共通処理。
    Python側のコードは従来通りsnake_caseのキーワード引数でモデルを構築してよい
    （populate_by_name=Trueのため）。
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
