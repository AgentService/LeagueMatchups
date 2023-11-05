import os

# Replace this with the correct path to your League of Legends installation
lockfile_path = 'C:\Riot Games\League of Legends\lockfile'

if os.path.isfile(lockfile_path):
    with open(lockfile_path, 'r') as file:
        lockfile_content = file.read().strip().split(':')
        # The token is the fourth item in the list
        riot_token = lockfile_content[3]
        port = lockfile_content[2]

        print(f"The Riot token is: {riot_token}")
else:
    print("Lockfile not found. Make sure the League client is running.")

import requests
import base64

# Disable SSL warnings, only for development.
requests.packages.urllib3.disable_warnings()

# Your token and port number should be retrieved dynamically from the lockfile,
# but for this example, I'm hardcoding them.
local_api_url = f'https://127.0.0.1:{port}/lol-summoner/v1/current-summoner'

# Base64 encode the token.
encoded_token = base64.b64encode(('riot:' + riot_token).encode('utf-8')).decode('utf-8')

# Add the token to your headers
headers = {
    'Authorization': f'Basic {encoded_token}'
}

# Make the request to the local API.
response = requests.get(local_api_url, headers=headers, verify=False)

if response.status_code == 200:
    summoner_info = response.json()
    summoner_name = summoner_info['displayName']
    print(f"Summoner name detected: {summoner_name}")
else:
    print(f"Could not detect the summoner name. Status Code: {response.status_code}")
    print(f"Response: {response.text}")
