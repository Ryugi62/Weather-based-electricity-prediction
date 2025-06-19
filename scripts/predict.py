import sys
import json
import joblib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL = joblib.load(ROOT / "models" / "best_model.joblib")


def main() -> None:
    payload = json.load(sys.stdin)
    inputs = payload.get("inputs", [])
    preds = MODEL.predict(inputs)
    json.dump({"predictions": preds.tolist()}, sys.stdout)


if __name__ == "__main__":
    main()
