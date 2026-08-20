import os
from ibm_watson_machine_learning import APIClient

API_KEY = "zVgyNHTQuOaxnkdQn2d7MYqjxbUnL627jTx6QCbkqamM"
URL = "https://us-south.ml.cloud.ibm.com" # Default region

wml_credentials = {
    "apikey": API_KEY,
    "url": URL
}
try:
    client = APIClient(wml_credentials)
    spaces = client.spaces.get_details()
    if 'resources' in spaces and len(spaces['resources']) > 0:
        for space in spaces['resources']:
            print(f"Found Space: {space['entity']['name']} (ID: {space['metadata']['id']})")
    else:
        print("No spaces found. The user needs to create one.")
except Exception as e:
    print(f"Error: {e}")
