import sys
import json
import joblib

# The trained linear regression model
MODEL = joblib.load("modles/linear_model.pkl")


def main():
    payload = json.load(sys.stdin)
    inputs = payload.get("inputs", [])
    preds = MODEL.predict(inputs)
    json.dump({"predictions": preds.tolist()}, sys.stdout)


if __name__ == "__main__":
    main()
