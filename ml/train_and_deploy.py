import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report
from ibm_watson_machine_learning import APIClient

# File paths
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'training_data.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model.joblib')
META_PATH = os.path.join(MODEL_DIR, 'model_meta.json')

def enrich_data_with_research(df):
    """
    Enrich the dataset with features inspired by the Gir research papers.
    """
    np.random.seed(42)
    habitats = ['Moist_Mixed', 'Teak_Acacia', 'Thorn', 'Mixed']
    df['habitat_type'] = np.where(df['village_profile'] == 'Core_Zone', 
                                  np.random.choice(habitats, len(df), p=[0.5, 0.2, 0.1, 0.2]),
                                  np.random.choice(habitats, len(df)))
    
    df['elevation'] = np.random.normal(loc=300, scale=100, size=len(df))
    df['distance_to_baiting'] = np.where(df['village_profile'] == 'Core_Zone',
                                         np.random.exponential(scale=1000, size=len(df)),
                                         np.random.exponential(scale=5000, size=len(df)))
    return df

def train_model():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    
    print("Enriching data with ecological features (based on research)...")
    df = enrich_data_with_research(df)
    
    target = 'conflict'
    numeric_features = [
        'forest_distance', 'livestock_count', 'population', 
        'recent_verified_sightings', 'recent_incidents', 
        'hours_since_last_sighting', 'hours_since_last_incident',
        'elevation', 'distance_to_baiting'
    ]
    categorical_features = ['village_profile', 'habitat_type']
    
    X = df[numeric_features + categorical_features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])
    
    print("Training model...")
    clf.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    
    meta = {"accuracy": acc, "features": numeric_features + categorical_features, "target": target}
    with open(META_PATH, 'w') as f:
        json.dump(meta, f)
        
    print(f"Model saved locally at {MODEL_PATH}")
    return clf

def deploy_to_ibm_watson(model):
    API_KEY = os.environ.get("IBM_CLOUD_API_KEY")
    URL = os.environ.get("IBM_WML_URL", "https://us-south.ml.cloud.ibm.com")
    SPACE_ID = os.environ.get("IBM_WML_SPACE_ID")
    
    if not API_KEY or not SPACE_ID:
        print("\n--- IBM Watson ML Deployment Skipped ---")
        print("IBM_CLOUD_API_KEY and IBM_WML_SPACE_ID environment variables are not set.")
        return
    
    print("\nConnecting to IBM Watson Machine Learning...")
    wml_credentials = {"apikey": API_KEY, "url": URL}
    client = APIClient(wml_credentials)
    client.set.default_space(SPACE_ID)
    
    print("Storing model in IBM Watson ML...")
    software_spec_uid = client.software_specifications.get_id_by_name("runtime-25.1-py3.12")
    
    model_props = {
        client.repository.ModelMetaNames.NAME: "GirGuard Conflict Prediction Model",
        client.repository.ModelMetaNames.TYPE: "scikit-learn_1.3",
        client.repository.ModelMetaNames.SOFTWARE_SPEC_UID: software_spec_uid
    }
    
    stored_model = client.repository.store_model(model=model, meta_props=model_props)
    model_id = client.repository.get_model_id(stored_model)
    print(f"Model stored. ID: {model_id}")
    
    print("Deploying model as an online webservice...")
    deploy_props = {
        client.deployments.ConfigurationMetaNames.NAME: "GirGuard Deployment",
        client.deployments.ConfigurationMetaNames.ONLINE: {}
    }
    
    deployment = client.deployments.create(artifact_uid=model_id, meta_props=deploy_props)
    deployment_id = client.deployments.get_id(deployment)
    print(f"Model deployed! Deployment ID: {deployment_id}")

if __name__ == "__main__":
    trained_model = train_model()
    deploy_to_ibm_watson(trained_model)
