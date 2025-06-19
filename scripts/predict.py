import sys
import json
import joblib
from pathlib import Path
from typing import List

try:
    import pandas as pd
except Exception:
    pd = None

# Older versions of scikit-learn do not define _RemainderColsList which may
# exist in the joblib. Provide a simple fallback to allow unpickling.
try:
    from sklearn.compose import _column_transformer as _ct
    if not hasattr(_ct, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass

        _ct._RemainderColsList = _RemainderColsList
except Exception:
    # If scikit-learn is unavailable, loading the model will fail later and the
    # caller can handle the error accordingly.
    pass

# Older versions of scikit-learn do not define _RemainderColsList which may
# exist in the joblib. Provide a simple fallback to allow unpickling.
try:
    from sklearn.compose import _column_transformer as _ct
    if not hasattr(_ct, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass

        _ct._RemainderColsList = _RemainderColsList
except Exception:
    # If scikit-learn is unavailable, loading the model will fail later and the
    # caller can handle the error accordingly.
    pass

ROOT = Path(__file__).resolve().parent.parent
MODEL = joblib.load(ROOT / "models" / "best_model.joblib")


def main() -> None:
    payload = json.load(sys.stdin)
    inputs: List[List[float]] = payload.get("inputs", [])

    if pd is not None:
        df = pd.DataFrame(inputs, columns=["생산량", "기온", "습도"])
        preds = MODEL.predict(df)
    else:
        preds = MODEL.predict(inputs)
    json.dump({"predictions": preds.tolist()}, sys.stdout)


if __name__ == "__main__":
    main()
