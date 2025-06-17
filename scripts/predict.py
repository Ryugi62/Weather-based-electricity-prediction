import sys
import json
import joblib

MODEL = joblib.load("models/energy_model.pkl")


def main():
    payload = json.load(sys.stdin)
    inputs = payload.get("inputs", [])
    preds = MODEL.predict(inputs)
    json.dump({"predictions": preds.tolist()}, sys.stdout)


if __name__ == "__main__":
    main()
